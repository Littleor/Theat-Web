<script>
export default {
	onLaunch: function() {
		if(this.token !== ""){
			uni.reLaunch({
				url: '/pages/main/main'
			})
		}
		// #ifdef APP-PLUS
		this.requests({
			url: 'version/check',
			data: {
				version: plus.runtime.version,
				appid: plus.runtime.appid
			},
			success: (res) => {
				let {update,desc,version,url} = res.data;
				if(update){
					uni.showModal({
					    title: `更新 - ${version}`,
					    content: desc,
						showCancel: false,
					    success: function (res) {
							if(res.confirm || res.cancel){
								uni.reLaunch({
									url: '/pages/user/index'
								})
								plus.runtime.openURL(url);								
								plus.runtime.quit();
							}
					    }
					});
				}
			}
		})
		// #endif
		console.log("onLaunch");
	},
	onShow: function() {
		console.log('App Show');
	},
	onHide: function() {
		console.log('App Hide');
	}
};
</script>

<style>
/* 解决头条小程序组件内引入字体不生效的问题 */
/* #ifdef MP-TOUTIAO */
@font-face {
	font-family: uniicons;
	src: url('/static/uni.ttf');
}
/* #endif */
</style>
