<template>
	<view class='contain'>
		<view class="header">
			<image id="avatar" mode="center" src="../../static/image/icon.png" @error="imageError"></image>
			<h2>情侣厅</h2>
			<p>为异地情侣提供共同观影服务</p>
		</view>
		<view class="action">
			<button @click="login" type="primary">登录/注册</button>
		</view>
		<view class="footer">
			<view class="thirdParty">
				<image src='../../static/font/qq.svg'></image>
				<image src='../../static/font/weixin.svg'></image>
				<image src='../../static/font/weibo.svg'></image>
			</view>
			<view style="margin-top:8px;">
				<radio style="transform:scale(0.75)" @click="agree = !agree" :checked="agree" color='#ffb6b9'>同意<span style='color:#007AFF'>《用户协议》和《隐私协议》</span></radio>
			</view>
		</view>

	</view>
</template>

<script>
	export default {
		data() {
			return {
				agree: false,
			}
		},
		methods: {
			login: function() {
				if (!this.agree) {
					uni.showToast({
						icon: 'none',
						title: '请先同意《用户协议》和《隐私协议》',
						position: 'bottom',
						duration: 1500,
						mask: true
					});
				}
				
			}
		}
	}
</script>

<style lang="scss" scoped>
	body {
		overflow: hidden;
	}

	h2 {
		text-shadow: 3px 3px 2px $uni-bg-color-mask;
		margin: 3px 0 3px 0;
	}

	p {
		margin: 0px;
		font-size: $uni-font-size-base;
	}

	.thirdParty {
		display: flex;
		justify-content: space-around;
	}

	.thirdParty image {
		box-shadow: 1px 1px 1px $uni-bg-color-mask-hint;
		padding: 4px;
		border-radius: 10vw;
		border: 2px solid white;
		margin: 0px;
		width: 10vw;
		height: 10vw;
	}

	.thirdParty image:active {
		box-shadow: 2px 2px 2px $uni-bg-color-mask-hint;
	}

	.contain {
		text-align: center;
		color: white;
		height: 100vh;
		width: 100vw;
		background-color: $uni-bg-color;

		display: flex;
		flex-direction: column;
		flex-wrap: nowrap;
		justify-content: space-between;
		align-items: stretch;

	}

	#avatar {
		box-shadow: 3px 3px 2px $uni-bg-color-mask;
		border: 2px solid $uni-border-color;
		border-radius: 50% 50% 50% 50%;
		max-width: 15vh;
		max-height: 15vh;
		width: 30vw;
		height: 30vw;
		background-color: #eeeeee;
	}

	button {
		margin: 10px 12vw 10px 12vw;
		background-color: $uni-color-warning;
	}

	.button-hover {
		background-color: $uni-color-highlight;
	}
</style>
