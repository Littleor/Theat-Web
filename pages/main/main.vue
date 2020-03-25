<template>
	<view>
		<uni-notice-bar showIcon :speed="60" style="margin: 0px;" scrollable="true" single="true" :text="notice"/>
		<view class="contain">

			<view class="action">
				<textarea @confirm="play" v-model="url" placeholder="请输入网络视频链接,支持mp4,m3u8,webm,flv,ogg等网络视频地址,或输入邀请密钥加入房间." />
				<button @click="play" type="primary">开始共影</button>
		</view>
	</view>
	</view>
</template>


<script>
	export default {
		data() {
			return {
				url: '',
				notice: '欢迎来到《情侣厅》'
			};
		},
		onReady() {

			this.requests({
				url: 'notice',
				data: {
					// #ifdef APP-PLUS
					version: plus.runtime.version,
					appid: plus.runtime.appid
					// #endif
				},
				success: (res) => {
					this.notice = res.data.notice;
				}
				})
		},
		methods:{
			play(){
					console.log(this.url);
			}
		}
	}
</script>

<style lang="scss" scoped>
	body{
		overflow: hidden;
	}
	.contain {
		background-color: rgb(241,241,241);
		text-align: center;
		color: $uni-text-color;
		height: 100vh;
		width: 100vw;
		display: flex;
		justify-content:center;
		align-items: center;
	}
	.action{
		width: 100vw;
		padding: 20px;
		margin-bottom: 80px;
	}
	.action textarea{
		border-radius: 10px;
		background-color: white;
		color: $uni-text-color;
		padding: 5%;
		margin-bottom: 20px;
		width: 90%;
		border: 2px solid #8e8e8e;
		text-align: left;
	}
	.action button{
		margin: 0px 10vw 0px 10vw;
	}
</style>
