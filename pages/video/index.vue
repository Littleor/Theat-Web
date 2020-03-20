<template>
	<view>
		<view class="contain">
			<video class="video" id="myVideo" src="https://muwall.cn/test.mp4" @error="onVideoError" @play="onVideoPlay" @pause="onVideoPause"
			 @timeupdate="onVideoTimeUpdate" @waiting="onVideoWait" @progress="onVideoProcessChange" @loadedmetadate="onVideoLoadedmetadate"
			 @controlstoggle="onVideoControlstoggle" controls vslide-gesture></video>
			<!-- page-gesture  -->
		</view>
		<view class="status">
			<p>
				<b>
					状态:{{(this.client.room == "" || this.roomNumber == 0) ? "暂未加入房间" :"已加入房间"}}
				</b>
			</p>
			<p>
				房间人数: {{this.roomNumber}}
			</p>
			<p>
				当前播放状态:
			</p>
		</view>
		<view class="action">
			<button style="width: 90vw;" type="primary" @click="createRoom">创建房间</button>
			<view>
				<input class="uni-input" id="room_id" @input="onKeyInput" placeholder="房间ID" />
				<button style="width: 90vw;" type="primary" @click="joinRoom">加入房间</button>
			</view>
		</view>
	</view>
</template>

<script>
	import io from 'socket.io-client-uni-app'
	export default {
		data() {
			return {
				src: '',
				socket: '',
				videoContext: '',
				client: {
					id: this.getId(),
					room: '',
					status: {
						playing: false,
						loading: true,
						process: 0,
						control: false,
						duration: 0
					},

					time: new Date().getTime()
				},
				roomNumber: 0,
				waitOthers: false,
				getMessage: false,
			}
		},
		onReady: function(res) {
			this.videoContext = uni.createVideoContext('myVideo');
			this.socket = io("ws://192.168.2.101:3000");
			this.addListener()
			this.socket.emit("registered", this.getClient())
		},
		methods: {
			onVideoPlay: function(e) {
				this.client.status.playing = true;
				this.onChangePlayStatus();
				console.log("开始播放")
			},
			onVideoPause: function(e) {
				this.client.status.playing = false;
				this.onChangePlayStatus();
				console.log("暂停")
			},
			onVideoTimeUpdate: function(e) {
				var duration = e.detail.duration;
				var currentTime = e.detail.currentTime;
				if (uni.getSystemInfoSync().platform == "android") {
					duration = e.detail.detail.duration;
					currentTime = e.detail.detail.currentTime;
				}
				this.client.status.duration = duration;
				this.client.status.process = currentTime;
				if (this.client.status.loading == true && this.client.status.playing == true) {
					//加载完成了
					this.client.status.loading = false;
					this.onChangePlayStatus()
				}
				console.log('每250ms更新,currentTime:' + currentTime + ',duration:' + duration)
			},
			onVideoWait: function(e) {
				this.client.status.loading = true;
				this.onChangePlayStatus()
				console.log("加载中")
			},
			onVideoError: function(e) {
				uni.showModal({
					content: e.target.errMsg,
					showCancel: false
				})
			},
			onVideoProcessChange: function(e) {
				this.client.status.process = (this.client.status.duration * e.detail.buffered) / 100;
				this.onChangePlayStatus();
				console.log("修改了进度:" + this.client.status.process);
			},
			onVideoLoadedmetadate: function(e) {
				console.log("加载完元数据")
				console.log(e)
			},
			onVideoControlstoggle: function() {
				console.log("控制按钮显示")
				console.log(e)
			},
			onKeyInput: function(event) {
				this.client.room = event.target.value
			},
			onChangePlayStatus:function() {
				if (this.client.room != "" && this.roomNumber != 0 && !this.getMessage) {
					this.socket.emit("adjust", this.getClient());
				}
			},
			addListener: function() {
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
					// this.socket.emit("logout",this.client);
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
					console.log(data);
				})
				//创建房间
				this.socket.on('createRoom', (data) => {
					this.roomNumber = 1;
					console.log(data);
				})
				this.socket.on('joinRoom', (data) => {
					let {
						room,
						status,
						number,
						time
					} = data;
					this.roomNumber = number;
					console.log(data);
				})
				//收到事件处理
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
						duration
					} = status;
					let delay = new Date().getTime() - sendTime;
					process = process + delay/1000;
					this.client.status = status;
					this.videoContext.seek(process);
					if (playing && !loading) {
						this.videoContext.play();
					} else {
						this.videoContext.pause();
					}
					if (loading) {
						this.waitOthers = true;
					} else {
						this.waitOthers = false;
					}
					setTimeout(()=>{this.getMessage = false;},300);
				})
			},
			getClient: function() {
				this.client.time = new Date().getTime()
				return this.client;
			},
			getId: function() {
				let id = uni.getStorageSync("id");
				if (id == null || id == "") {
					uni.setStorageSync('id', this.generateId());
					return this.getId();
				}
				return id;
			},
			generateId: function() {
				var d = new Date().getTime();
				var uuid = 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
					var r = (d + Math.random() * 16) % 16 | 0;
					d = Math.floor(d / 16);
					return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
				});
				return uuid;
			},
			createRoom: function() {
				this.socket.emit("createRoom", this.client);
				this.client.room = this.client.id;
			},
			joinRoom: function() {
				this.socket.emit("joinRoom", this.client);
			}
		}
	}
</script>

<style>
	.contain {
		width: 100vw;
	}

	.video {
		width: 90vw;
		margin: 10px 5vw 10px 5vw
	}

	.action {
		width: 100vw;
		text-align: center;
	}

	.status {
		width: 100vw;
		padding-left: 20px;
	}
</style>
