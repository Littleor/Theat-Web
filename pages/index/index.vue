<template>

	<view>
		<view class="contain">
			<video class="video" id="myVideo" src="https://img.cdn.aliyun.dcloud.net.cn/guide/uniapp/%E7%AC%AC1%E8%AE%B2%EF%BC%88uni-app%E4%BA%A7%E5%93%81%E4%BB%8B%E7%BB%8D%EF%BC%89-%20DCloud%E5%AE%98%E6%96%B9%E8%A7%86%E9%A2%91%E6%95%99%E7%A8%8B@20181126.mp4"
			 @error="videoErrorCallback" enable-danmu page-gesture controls></video>
		</view>
		<view class="status">
			<p>
				<b>
					状态:{{(this.client.room == "" || this.roomNumber == 0) ? "暂未加入房间" : this.client.room}}
				</b>
			</p>
			<p>
				房间人数: {{this.roomNumber}}
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
				client: {
					id: this.getId(),
					room: '',
					process: 0,
					status: '',
					time: new Date().getTime()
				},
				roomNumber: 0,
			}
		},
		onReady: function(res) {
			// #ifndef MP-ALIPAY
			this.videoContext = uni.createVideoContext('myVideo')
			// #endif
			this.socket = io("ws://192.168.2.101:3000");
			this.addListener()
			this.socket.emit("registered", this.getClient())
		},
		methods: {
			videoErrorCallback: function(e) {
				uni.showModal({
					content: e.target.errMsg,
					showCancel: false
				})
			},
			onKeyInput: function(event) {
				this.client.room = event.target.value
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
				this.socket.on('events', (data) => {
					
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
