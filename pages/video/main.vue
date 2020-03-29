<template>
	<view class="contain">
		<view class="video">
			<video id="video" :src="client.src" @error="onVideoError" @play="onVideoPlay" @pause="onVideoPause" @waiting="onVideoWait"
			 @timeupdate="onVideoUpdate" controls vslide-gesture></video>
		</view>
		<view class="action">
			<uni-card class="card" title="操作" :extra="'当前人数: ' + this.roomNumber + ' 人'">
				<view class="card-content">
					<view @click="sync" class="icon-button">
						<uni-icons type="loop" size="30"></uni-icons>
						<view>同步</view>
					</view>
					<view :data-clipboard-text="'我正在《情侣厅》看电影,复制这条信息再打开《情侣厅》,来和我一起同步观影!下载链接:https://muwall.cn/. \n $_$' + this.client.room +'$_$'"
					 @click="share" class="icon-button btn">
						<uni-icons type="redo" size="30" color="#ff7d84"></uni-icons>
						<view style="color:#ff7d84">分享</view>
					</view>
					<view @click="reload" class="icon-button">
						<uni-icons type="reload" size="30"></uni-icons>
						<view>重载</view>
					</view>
				</view>
			</uni-card>
		</view>
	</view>
</template>

<script>
	import io from 'socket.io-client-uni-app';
	import md5 from 'md5';
	import Clipboard from 'clipboard';
	export default {
		data() {
			return {
				socket: '',
				videoContext: '',
				client: {
					id: this.getId(),
					src: '',
					room: '',
					status: {
						playing: false,
						loading: true,
						process: 0,
						control: false,
						duration: 0,
						type: ''
					},
					time: new Date().getTime()
				},
				roomNumber: 0,
				waitOthers: false,
				getMessage: false,
				lastAction: {
					type: '',
					time: 0
				},
				excute: {
					type: '',
					time: 0
				},
				isSync: false
			}
		},
		onLoad(res) {
			let url = JSON.parse(decodeURIComponent(res.url));
			if (url.indexOf('情侣厅') !== -1 && url.indexOf('$$') && (url.indexOf('$_$') != url.lastIndexOf('$_$'))) {
				this.client.room = url.substring(url.indexOf('$_$') + 3, url.lastIndexOf('$_$'));
				return
			}
			this.client.src = url;
		},
		onUnload() {
			this.socket.emit("logout", this.client);
			this.socket.disconnect();
			this.socket.close();
		},
		onReady: function(res) {
			this.videoContext = uni.createVideoContext('video');
			this.socket = io("ws://theatapi.sixming.com/");
			this.addListener();
			this.socket.emit("registered", this.getClient());
			if (this.client.src !== '') {
				this.createRoom();
				return;
			}
			if (this.client.room !== '') {
				this.joinRoom();
			}
			if (this.client.id != this.client.room) {
				setInterval(() => {
					this.sendMessage('requestSync');
				}, 1000 * 30);
			}
		},
		methods: {
			sync() {
				this.isSync = true;
				this.sendMessage('requestSync');
			},
			share() {
				// #ifdef APP-PLUS
				uni.setClipboardData({
					data: '我正在《情侣厅》看电影,复制这条信息再打开《情侣厅》,来和我一起同步观影!\n下载链接:https://www.coolapk.com/apk/258630.\n$_$' + this.client.room +
						'$_$',
					complete: () => {
						this.toast('已把邀请内容复制到剪贴板,如未调起分享请直接发送给对方即可.');
					}
				});
				return;
				// #endif
			},
			reload() {
				uni.redirectTo({
					url: `/pages/video/main?url=${encodeURIComponent(JSON.stringify(this.client.src))}`
				});
			},
			onVideoPlay: function() {
				this.client.status.playing = true;
				if (this.excute.type == 'play' && (new Date().getTime() - this.excute.time) <= 1200) {
					console.log('对方请求的play');
					return;
				}
				this.sendMessage('play');
			},
			onVideoPause: function() {
				this.client.status.playing = false;
				if (this.excute.type == 'pause' && (new Date().getTime() - this.excute.time) <= 1200) {
					console.log('对方请求的Pause');
					return;
				}
				this.sendMessage('pause');
			},
			onVideoWait: function(e) {
				console.log('加载ing');
				this.client.status.loading = true;
				this.sendMessage('loading');
			},
			onVideoUpdate: function(e) {
				//正在播放的时候 250ms调用
				let duration = e.detail.duration;
				let currentTime = e.detail.currentTime;
				// #ifdef APP-PLUS
				duration = e.detail.detail.duration;
				currentTime = e.detail.detail.currentTime;
				// #endif
				let clientCurrentTime = this.client.status.process;
				this.client.status.process = currentTime;
				this.client.status.duration = duration;
				if (this.client.status.loading) {
					//代表加载完成
					console.log('加载完成');
					this.client.status.loading = false;
					if (!this.getMessage) {
						this.sendMessage('loaded');
					}
					// this.getMessage = false;
				}
				if (this.excute.type == 'process' && (new Date().getTime() - this.excute.time) <= 800) {
					//调整进度时避免对方回调loading和loaded
					console.log('对方调整了进度');
					return;
				}
				if (currentTime != 0 && Math.abs(currentTime - clientCurrentTime) >= 1.2 && !this.getMessage) {
					//调整了进度
					this.client.status.process = currentTime;
					this.sendMessage('process');
					console.log('自己调整了进度process');
					return;
				}
			},
			sendMessage: function(type) {
				if (this.excute.type == 'process' && (new Date().getTime() - this.excute.time) <= 800) {
					//调整进度时避免对方回调loading和loaded
					if(type == 'loade'){
						this.excute.type == '';
					}
					return;
				}
				if (!this.getMessage || type == 'responseSync' || type == 'requestSync') {
					this.lastAction.type = type;
					this.lastAction.time = new Date().getTime();
					this.client.status.type = type;
					this.socket.emit('adjust', this.getClient());
					this.client.status.type = '';
				}
			},

			onVideoError: function(e) {
				console.log(e);
			},
			addListener: function() {
				//收到事件
				this.socket.on('adjust', (data) => {
					this.getMessage = true;
					let {
						id,
						room,
						status,
						sendTime,
						time
					} = data;
					let {
						playing,
						loading,
						process,
						control,
						duration,
						type
					} = status;
					let delay = new Date().getTime() - sendTime;
					process = process + delay / 1000.0;
					if(this.lastAction.type == 'process' && type == 'process' && (new Date().getTime() - this.lastAction.time) <= 300){
						return;
					}
					if (this.excute.type !== '' && (new Date().getTime() - this.excute.time) <= 1200) {
						return;
					}
					this.getMessage = true;
					this.excute.type = type;
					this.excute.time = new Date().getTime();
					console.log('收到' + type + ':' + process);
					switch (type) {
						case 'play':
							this.client.status.playing = true;
							this.client.status.duration = duration;
							this.client.status.process = process;
							if(uni.getSystemInfoSync().platform==='android'){
								process = Math.ceil(process)
							}
							this.videoContext.seek(process);
							this.videoContext.play();
							this.toast('对方开始播放');
							break;
						case 'pause':
							this.client.status.playing = false;
							this.client.status.duration = duration;
							this.client.status.process = process;
							if(uni.getSystemInfoSync().platform==='android'){
								process = Math.ceil(process)
							}
							this.videoContext.seek(process);
							this.videoContext.pause();
							this.getMessage = false;
							this.toast('对方已暂停');
							break;
						case 'loading':
							this.waitOthers = true;
							this.client.status.playing = false;
							this.client.status.duration = duration;
							this.client.status.process = process;
							if(uni.getSystemInfoSync().platform==='android'){
								process = Math.ceil(process)
							}
							this.videoContext.seek(process);
							this.videoContext.pause();
							this.toast('等待对方加载ing');
							break;
						case 'loaded':
							this.waitOthers = false;
							this.client.status.playing = true;
							this.client.status.duration = duration;
							this.client.status.process = process;
							if(uni.getSystemInfoSync().platform==='android'){
								process = Math.ceil(process)
							}
							this.videoContext.seek(process);
							this.videoContext.play();
							this.toast('对方加载完成');
							break;
						case 'process':
							
							this.client.status.playing = true;
							this.client.status.duration = duration;
							this.client.status.process = process;
							if(uni.getSystemInfoSync().platform==='android'){
								process = Math.ceil(process)
							}
							this.videoContext.seek(process);
							this.videoContext.play();
							this.toast('对方调整了进度');
							break;
						case 'requestSync':
							this.sendMessage('responseSync');
							console.log('对方请求同步');
							break;
						case 'responseSync':
							this.client.status.playing = playing;
							this.client.status.duration = duration;
							this.client.status.process = process;
							if(uni.getSystemInfoSync().platform==='android'){
								process = Math.ceil(process)
							}
							this.videoContext.seek(process);
							if (playing) {
								this.videoContext.play();
							} else {
								this.videoContext.pause();
							}
							if (this.isSync) {
								this.toast('已同步');
								this.isSync = false;
							}
							break;
						default:
							break;
							//校准
							// this.client.status.playing = playing;
							// this.client.status.duration = duration;
							// this.client.status.process = process;
							// this.videoContext.seek(process);
							// this.videoContext.play();
					}
					setTimeout(() => {
						this.getMessage = false;
					}, 1000);
				});


				// 连接成功
				this.socket.on('connect', () => {
					console.log('连接成功');
					uni.showToast({
						title: '连接成功'
					})
				});
				// 正在连接
				this.socket.on('connecting', d => {
					console.log('正在连接', d);
				});
				// 连接错误
				this.socket.on('connect_error', d => {
					console.log('连接失败', d);
				});
				// 连接超时
				this.socket.on('connect_timeout', d => {
					console.log('连接超时', d);
				});
				// 断开连接
				this.socket.on('disconnect', reason => {
					console.log('断开连接', reason);
				});
				// 重新连接
				this.socket.on('reconnect', attemptNumber => {
					console.log('成功重连', attemptNumber);
				});
				// 连接失败
				this.socket.on('reconnect_failed', () => {
					console.log('重连失败');
				});
				// 尝试重新连接
				this.socket.on('reconnect_attempt', () => {
					console.log('尝试重新重连');
				});
				// 错误发生，并且无法被其他事件类型所处理
				this.socket.on('error', err => {
					console.log('错误发生，并且无法被其他事件类型所处理', err);
				});
				//注册
				this.socket.on('registered', (data) => {
					console.log("注册成功");
				})
				//创建房间
				this.socket.on('createRoom', (data) => {
					this.roomNumber = 1;
					console.log(data);
				})
				this.socket.on('joinRoom', (data) => {
					let {
						room,
						src,
						status,
						number,
						time
					} = data;
					this.client.src = src;
					this.roomNumber = number;
					console.log(data);
				})
				this.socket.on('logout', (data) => {
					let {
						number,
						time
					} = data;
					this.roomNumber = number;
					console.log(data);
				})
			},
			getClient: function() {
				this.client.time = new Date().getTime()
				return this.client;
			},
			getId() {
				if (this.generateId() == '') {
					this.toast('登录状态异常请重新登录!');
					uni.setStorageSync('token', '');
					uni.reLaunch({
						url: '/pages/user/login'
					})
					return;
				}
				return this.generateId();
			},
			generateId: function() {
				let email = uni.getStorageSync('email') || '';
				if (email == '') {
					return '';
				}
				return md5(email);
			},
			createRoom: function() {
				this.client.room = this.client.id;
				this.socket.emit("createRoom", this.client);
			},
			joinRoom: function() {
				this.socket.emit("joinRoom", this.client);
			},
			initClipboard() {
				// #ifdef H5
				const clipboard = new Clipboard('.btn');
				clipboard.on('success', (e) => {
					console.log('已将邀请内容复制到剪贴板,请直接复制给对方');
				});
				clipboard.on('error', (e) => {
					console.log('复制失败，请再次尝试');
				});
				// #endif
			}
		},
		mounted() {
			this.initClipboard();
		}

	}
</script>

<style lang="scss" scoped>
	.contain {
		background-color: rgb(241, 241, 241);
		text-align: center;
		color: $uni-text-color;
		height: 100vh;
		width: 100vw;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.video video {
		margin: 2vh 0 2vh 0;
		width: 90vw;
	}

	.card {
		text-align: left;
		width: 90vw;
	}

	.card-content {
		display: flex;
		width: 100%;
		justify-content: space-around;
	}

	.icon-button {
		margin: 10px;
		text-align: center;
	}

	.icon-button:active {
		color: #ff6973;
		text-shadow: 1px 1px 1px $uni-bg-color-mask-hint;
	}
</style>
