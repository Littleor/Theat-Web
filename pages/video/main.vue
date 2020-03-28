<template>
	<view class="contain">
		<view class="video">
			<video id="video" :src="client.src" @error="onVideoError" @play="onVideoPlay" @pause="onVideoPause" @waiting="onVideoWait"
			 @timeupdate="onPlayUpdate" controls vslide-gesture></video>
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
				waitForResponse: '',
				execute: ''
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
			this.socket = io("ws://192.168.2.101:3000");
			this.addListener();
			this.socket.emit("registered", this.getClient());
			setInterval(() => {
				this.update();
			}, 240);
			if (this.client.src !== '') {
				this.createRoom();
				return;
			}
			if (this.client.room !== '') {
				this.joinRoom();
			}
		},
		methods: {
			sync() {},
			share() {
				// #ifdef APP-PLUS
				uni.shareWithSystem({
					type: 'text',
					summary: '我正在《情侣厅》看电影,复制这条信息再打开《情侣厅》,来和我一起同步观影!下载链接:https://muwall.cn/.\n$_$' + this.client.room + '$_$',
					success() {
						// 分享完成，请注意此时不一定是成功分享
						uni.setClipboardData({
							data: '我正在《情侣厅》看电影,复制这条信息再打开《情侣厅》,来和我一起同步观影!下载链接:https://muwall.cn/.\n$_$' + this.client.room + '$_$',
							complete: () => {
								this.toast('已把邀请内容复制到剪贴板,如未调起分享请直接发送给对方即可.');
							}
						});
					},
					fail() {
						uni.setClipboardData({
							data: '我正在《情侣厅》看电影,复制这条信息再打开《情侣厅》,来和我一起同步观影!下载链接:"https://muwall.cn/".\n$_$' + this.client.room + '$_$',
							complete: () => {
								this.toast('调用分享失败,已把邀请内容复制到剪贴板,请直接发送给对方即可.');
							}
						});
					}
				})
				return;
				// #endif
				// #ifndef H5 
				uni.setClipboardData({
					data: '我正在《情侣厅》看电影,复制这条信息再打开《情侣厅》,来和我一起同步观影!下载链接:"https://muwall.cn/".\n$_$' + this.client.room + '$_$',
					complete: () => {
						this.toast('已把邀请内容复制到剪贴板,请发送给对方即可.');
					}
				});
				return;
				// #endif
			},
			reload() {

			},
			onPlayUpdate: function(e) {
				//正在播放的时候 250ms调用
				let duration = e.detail.duration;
				let currentTime = e.detail.currentTime;
				if (uni.getSystemInfoSync().platform == "android") {
					duration = e.detail.detail.duration;
					currentTime = e.detail.detail.currentTime;
				}
				if(Math.abs(currentTime - this.client.status.process) >= 0.6){
					//调整了进度
					this.client.status.process = currentTime;
					this.client.status.duration = duration;
					this.onProcessChange();
					return;
				}
				this.client.status.process = currentTime;
				this.client.status.duration = duration;
			},
			update() {

			},
			onVideoWait: function(e) {
				if(this.waitForResponse == '' && this.execute == ''){
					//非人工因数导致的加载
					console.log("非人工因数导致的加载");
					this.onChangePlayStatus('load');
				}
				else{
					console.log("人工因数导致加载ing");
				}
				this.client.status.loading = true;
				let currentTime = this.client.status.process;
				let interval = setInterval(() => {
					if (Math.abs(this.client.status.process - currentTime) >= 0.30) {
						//加载完成
						this.onVideoLoaded();
						clearInterval(interval);
					}
				}, 250);
				
			},
			onVideoLoaded() {
				//当视频加载完成
				console.log("加载完成");
				this.client.status.loading = false;
				// if (this.waitForResponse == 'play') {
				// 	//自己Play加载完成后暂停
				// 	console.log('加载完成Pause等待对方加载');
				// 	this.videoContext.pause();
				// }
				if (this.execute == 'play') {
					//响应对方请求Play
					console.log('加载完成对方的请求Play');
					this.reponse('play');
				}
				else if (this.execute == 'process')
				{
					//响应对方的process
					console.log('加载完成对方的请求process');
					this.reponse('process');
					
				}
				else if(this.waitForResponse == 'process'){
				}
				else if(this.execute == 'loaded'){
					//响应对方的loaded
					console.log('加载完成对方的请求loaded');
					this.reponse('loaded');
				}
				else if(this.execute == '' && this.waitForResponse == ''){
					this.onChangePlayStatus('loaded');
					this.videoContext.pause();
				}
				else{}
			},
			onVideoPlay: function(e) {
				this.client.status.playing = true;
				if (this.execute == 'play') {
					console.log("对方启动播放");
				} else if (this.waitForResponse == 'play') {
					console.log("对方response播放请求");
				}
				else if(this.waitForResponse == 'process'){
					console.log("对方response修改进度请求");
				}
				else if(this.waitForResponse == 'loaded'){
					console.log("对方response等待请求");
				}
				 else if(this.waitForResponse == '' && this.execute == ''){
					console.log("自己启动播放");
					this.onChangePlayStatus('play');
				}
				else{
					
				}
			},
			onVideoPause: function(e) {
				this.client.status.playing = false;
				if (this.waitForResponse == 'play') {
					//代表等待对方播放的时候Pause
					console.log('代表等待对方播放的时候Pause');
				} else if (this.execute == 'pause') {
					//响应对方请求暂停
					console.log('响应对方请求暂停');
					this.reponse('pause');
				} else if (this.waitForResponse == 'pause') {
					console.log('对方response暂停');
				} else if(this.execute == 'load')
				{
					console.log('响应对方请求load');
					this.reponse('load');
				}
				else if(this.waitForResponse == 'loaded'){
					console.log('代表等待对方loaded的时候');
				}
				else if(this.waitForResponse == '' && this.execute == ''){
					//自己发起请求
					console.log('自己发起Pause请求');
					this.onChangePlayStatus('pause');
				}
				else{}

			},
			onProcessChange() {
				//当用户自己手动调整进度
				console.log("自己手动调整进度条并已加载完成");
				this.onChangePlayStatus('process');
				this.videoContext.pause();
			},
			changePlayStatus() {

			},
			onVideoError: function(e) {
				console.log(e);
			},
			reponse:function(type) {
				this.execute = '';
				this.waitForResponse = '';
				this.client.status.type = type;
				this.socket.emit(type, this.getClient());
				this.client.status.type = '';
			},
			onChangePlayStatus: function(type) {
				this.client.status.type = type;
				this.waitForResponse = type;
				this.socket.emit(type, this.getClient());
				this.client.status.type = '';
			},
			addListener: function() {
				this.socket.on('loaded', (data) => {
					if (this.waitForResponse == 'loaded') {
						//用户发出之后接到对方的response
						console.log('对方响应了自己的load');
						this.videoContext.play();
						this.waitForResponse = '';
					} else {
						//用户接到对方的请求
						this.execute = 'loaded';
						this.videoContext.play();
					}
				})
				this.socket.on('load', (data) => {
					if (this.waitForResponse == 'load') {
						//用户发出之后接到对方的response
						console.log('对方响应了自己的load');
						this.waitForResponse = '';
					} else {
						//用户接到对方的请求
						this.execute = 'load';
						this.videoContext.pause();
					}
				})
				this.socket.on('process', (data) => {
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
					if (this.waitForResponse == 'process') {
						//用户发出之后接到对方的response
						console.log('对方响应了自己的process');
						this.videoContext.play();
						this.waitForResponse = '';
					} else {
						//用户接到对方播放的请求
						this.execute = 'process';
						this.videoContext.seek(process);
					}
				})

				this.socket.on('pause', (data) => {
					if (this.waitForResponse == 'pause') {
						//用户发出之后接到对方的response
						console.log('对方响应了自己的pause');
						this.waitForResponse = '';
					} else {
						//用户接到对方的请求
						this.execute = 'pause';
						this.videoContext.pause();
					}
				})

				this.socket.on('play', (data) => {
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
					if (this.waitForResponse == type) {
						//用户发出之后接到对方的response
						this.videoContext.play();
						this.waitForResponse = '';
					} else {
						//用户接到对方播放的请求
						this.execute = type;
						this.videoContext.seek(process);
						this.videoContext.play();
					}
				})

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

					this.client.status = status;
					this.videoContext.seek(process);
					if (loading) {
						this.waitOthers = true;
					} else {
						this.waitOthers = false;
					}
					if (playing && !loading && !this.client.status.loading) {
						this.videoContext.play();
					} else {
						this.videoContext.pause();
					}
					setTimeout(() => {
						this.getMessage = false;
					}, 320);
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
