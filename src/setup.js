/**
* 手机助手调用接口
* author : chenyiguo@360.cn | wangwenming@360.cn 
* latest : 2013-07-22
*/
/*
if (!window.console) {
	window.console = {
		log: function() {}
	}
}
*/
(function(){
	// 全局变量
	var isIE6 = $.browser.msie && $.browser.version === '6.0';
	// 根据当前URL，获取pid。如 abc.d.leidian.com，则 pro 为 abc.d。去host中 leidian.com 前面的部分。
	var pro = '', pid = '';
	try {
		var host = location.host,
			pos = host.indexOf('leidian.com');
		if (pos !== -1) {
			pro = host.substr(0, pos - 1);
		}
	} catch (e) {
	}
	
	// pro 参数特殊处理，是为了和PC一致。
	if (pro === 'www') {
		pro = 'shouji';
	} else if (pro === 'theme' || pro === 'wallpaper') {
		pro = 'm_' + pro;
	}
	
	if (location.pathname.toLowerCase() === '/zt/liuyan.html') {
		pid = 'liuyan';
	}
	/**
	 * 对话框模块
	 */
	window.NotificationManager = {
		$dialog: null,
		$contentWrapper: null,
		init: function() {
			var $doc = $( document ),
				$dialog;

			var css = '<style type="text/css">'
				+ '#setupDialog .main-text {color: #333; font-size: 16px; line-height: 24px;}'
				+ '#setupDialog .sub-text {color: #666; font-size: 12px; height: 18px; line-height: 18px;text-align:left;margin-left:91px;padding-bottom:20px;}'
				+ '#setupDialog .macos {margin-left:0;text-align:center;}' 
				+ '#setupDialog .inslocal,#setupDialog .inslocal a {font-size:14px;line-height:16px;}'
				+ '#setupDialog .inslocal {height:16px;padding:0 0 20px 0}'
				+ '#setupDialog .button {margin: 20px auto 16px;display: block; width: 104px; height: 34px; background: url(http://theme.leidian.com/static/img/setup_button_sprites.png) no-repeat;_background-image:none;_filter: progid:DXImageTransform.Microsoft.AlphaImageLoader(src="http://theme.leidian.com/static/img/setup_button_sprites.png", sizingMethod="crop");font-size:14px;color:#fff;text-align: center;line-height: 34px;background-position: -2px -1px;}'
				+ '#setupDialog .button:hover {background-position: -2px -39px;}'
				+ '#setupDialog .button:active {background-position: -2px -77px;}'
				+ '.setup-mask {background: #000;opacity: .6;filter: alpha(opacity=60);overflow: hidden;margin: 0;padding: 0;position: fixed;_position: absolute;top: 0;left: 0;bottom: 0;right: 0;width: 100%;height: 100%;z-index: 9999;display: block;'
				+ '</style>';
			
			$(css).appendTo('head');
		
			$dialog = this.$dialog = $( '<div class="setup_dialog" id="setupDialog"' + ( isIE6 ? 'style="position:absolute;top:' + top + '"' : '' ) + '>' + 
							'<div class="dg_wrapper">' + 
								'<a class="dg_btn_close" href="javascript:void(0)">×</a>' + 
								'<div class="dg_header" style="color: #333; font-size: 14px;font-weight: bold; background: url(http://theme.leidian.com/static/img/setup_dialog_icon.png) no-repeat 15px center;text-indent: 36px;text-align:left;">雷电手机搜索提示</div>' +
								'<div class="dg_line" style="margin-top: 1px; height: 1px; background: url(http://theme.leidian.com/static/img/setup_dialog_line.png) repeat-x;"></div>' +
								'<div class="dg_content" style="text-align:center;"></div>' +
							'</div>' +
						'</div>').appendTo(document.body);
			this.$contentWrapper = $dialog.find('.dg_content');

			// 关闭功能，使用代理方式绑定，因为对话框内容区也有“关闭”链接，是动态构建的。
			$dialog.on('click', 'a.dg_btn_close, .setup-dialog-close', function( e ){
				$dialog.hide();
				$('.setup-mask').remove();
				$doc.off( 'click.setupdialog' );
				e.preventDefault();
			});

			// 绑定全局关闭事件
			/*
			$doc.on( 'click.setupdialog', function( e ){
				var target = e.target;

				if( target !== $dialog[0] && !$.contains($dialog[0], target) ){
					$dialog.hide();
					$('.setup-mask').remove();
					$doc.off( 'click.setupdialog' );
				}
			});
			*/
		},
		show: function(content) {
			if( isIE6 ) {
				var top = document.documentElement.scrollTop + document.documentElement.clientHeight / 2 + 'px';
				this.$dialog.css({position : 'absolute', top : top});
			}
			
			this.$contentWrapper.html(content);
			this.$dialog.before('<div class="setup-mask" style="z-index:304;"></div>');
			$('.setup-mask').css({height: $(document).height()});
			this.$dialog.show();
		},
		// 非Windows的弹窗提示
		notWindows: function() {
			var $dialog = this.$dialog,
				$ttl,
				// pngfix为了好玩。因为：不是windows，怎么可能是IE6呢？
				content = '<div style="background: url(http://theme.leidian.com/static/img/setup_dialog_sad.png) no-repeat center; *background:none; filter:progid:DXImageTransform.Microsoft.AlphaImageLoader(src=\'http://theme.leidian.com/static/img/setup_dialog_sad.png\', sizingMethod=\'scale\');width: 100%;*width:86px; height: 54px; margin:14px 0;"></div>' +
				'<div class="main-text' + (isIE6 ? ' pngfix' : '') + '" style="height: 24px;">您的操作系统暂不支持“安装、一键装进手机”功能</div>'+
				'<div class="sub-text macos" style="margin-top: 17px; height: 18px;"><span>目前仅在windows系统下可使用该功能</span><span style="width: 1px; height:12px; background: #e0e0e0;vertical-align: middle;margin: 0 12px;display: inline-block;"></span><span><span class="setup-dialog-ttl">15</span>秒后自动<a class="setup-dialog-close" href="javascript:void(0)" style="color: #0063c8;">关闭</a></span></div>' + getInstallLinkHtml('macos');
			this.show(content);
			$ttl = this.$contentWrapper.find('.setup-dialog-ttl');
			
			// 倒计时自动关闭
			var ttl = $ttl.text();
			setTimeout(function() {
				if (ttl == 0 || !$dialog.is(':visible')) {
					$dialog.hide();
					$('.setup-mask').remove();
					return;
				}

				$ttl.text(ttl--);
				setTimeout(arguments.callee, 1000);
			}, 1000);
		},
		// 没有安装助手的弹窗提示
		mmNotInstalled: function() {
			var $dialog = this.$dialog,
				self = this,
				content = '<div class="main-text' + (isIE6 ? ' pngfix' : '') + '" style="margin: 0 17px; text-align: left;padding-left: 70px; background: url(http://theme.leidian.com/static/img/setup_icon_mm.png) no-repeat top left; ">体验“一键装进手机”功能，需最新版 360手机助手支持。</div>\
				<a href="http://down.360safe.com/instbeta.exe" class="button install" data-setuplog="install-weishi">立即安装</a>\
				<div class="sub-text">注：360手机助手内置在最新版安全卫士中</div>' + getInstallLinkHtml('weishi');

			this.show(content);

			// 点击完立即安装后，窗口变成提示重启浏览器的tips：
			var $wrapper = this.$contentWrapper;
			$wrapper.find('.install').on('click', function(e) {
				$wrapper.find('.main-text').html('');
				$(this).hide();
				$wrapper.find('.sub-text').hide();
				
				content = '<div style="margin: 8px 40px;">安装完成后，你仅需重启浏览器，再次访问雷电网即可将海量资源一键装进手机。</div>';
				self.show(content);
				//妈的，直接monitorLog，没法请求，擦。。。
				setTimeout(function() {
					monitorLog({
						mod : 'setupinstall',
						product : 'weishi'
					});
				} , 2700);
			});
		},
		mmTooOld: function() {
			var $dialog = this.$dialog,
				self = this,
				content = '<div  class="main-text' + (isIE6 ? ' pngfix' : '') + '" style="margin: 0 17px; text-align: left;padding-left: 70px; background: url(http://theme.leidian.com/static/img/setup_icon_mm.png) no-repeat top left; ">体验“一键装进手机”功能，需最新版 360手机助手支持。</div>\
				<a href="http://down.360safe.com/instmobilemgr_beta.exe" class="button update" data-setuplog="install-zhushou">立即升级</a>' + getInstallLinkHtml('zhushou');

			this.show(content);

			// 因为安装完成并不需要重启浏览器，所以在这里轮询检查版本号，如果达标，则直接改变对话框。帅呆了！
			var $wrapper = this.$contentWrapper;
			$wrapper.find('.update').on('click', function(e) {
				setTimeout(function() {
					if (!$dialog.is(':visible')) {
						return;
					}

					var version = MMClient.getVersion();
					if (!!version && versionCompare(version, '2.0.0.2185') >= 0) {
						content = '<div style="font-size: 16px;font-weight: bold;">恭喜您，升级成功！</div>\
							<div style="margin: 8px 0;">现在您可以返回雷电网将海量资源一键装进手机啦！</div>\
							<a href="javascript:void(0)" class="button setup-dialog-close' + (isIE6 ? ' pngfix' : '') + '">我知道了</a>';
						self.show(content);
						/*
						$wrapper.css({height: 95}).find('.main-text').html('').css({background:''}).before('');
						$(self).removeClass('update').unbind('click').addClass('setup-dialog-close');
						$wrapper.find('.sub-text').hide();
						*/
						monitorLog({
							mod : 'installsucc',
							product : 'zhushou'
						});
						return;
					}

					setTimeout(arguments.callee, 1000);
				}, 1000);
			});
		}
	};
	
	//将url中的a=1&b=2&c=3解析为{a:1,b:2,c:3}
	function parseURL(str) {
		str = str || '';
		str = str.replace(/^zhushou360\:\/\//, '');
		var arr = str.split(/&/g) , result = {};
		$(arr).each(function(key , val) {
			var list = val.split(/\=/);
			var resultKey = list[0] , resultVal;
			if(list.length > 2) {
				resultVal = list.slice(1).join('=');
			} else {
				resultVal = list[1];
			}
			result[resultKey] = resultVal;
		});
		return result;
	}
	//根据zhushou协议数组获取资源地址数组
	//["http://zly.leidian.com/zhushou360://type=mp3&dtype=ring&icon=null&op=0&name=%E8%A6%81%E7%9A%84%E5%B0%B1%E6%98%AF%E8%BF%99%E7%A7%8D%E6%84%9F%E8%A7%89&url=http://dl.so.keniub.com/ring/d/7894945dbc9f77787e297aab28961aeb/%E8%A6%81%E7%9A%84%E5%B0%B1%E6%98%AF%E8%BF%99%E7%A7%8D%E6%84%9F%E8%A7%89.mp3",
	//"zhushou360://type=apk&name=%E5%BF%AB%E6%8B%8D%E4%BA%8C%E7%BB%B4%E7%A0%81&dtype=soft&op=0&icon=http://p8.qhimg.com/t013d0f3296147fe9a8.png&url=http://shouji.360tpcdn.com/360sj/dev/20130815/com.lingdong.client.android_125_142209.apk"]
	//则结果为 
	//['http://dl.so.keniub.com/ring/d/7894945dbc9f77787e297aab28961aeb/%E8%A6%81%E7%9A%84%E5%B0%B1%E6%98%AF%E8%BF%99%E7%A7%8D%E6%84%9F%E8%A7%89.mp3',
	// 'http://shouji.360tpcdn.com/360sj/dev/20130815/com.lingdong.client.android_125_142209.apk']
 	function getApkUrls(arr) {
 		arr = arr || [];
 		var result = [];
 		$(arr).each(function(i , str) {
			var parseObj = parseURL(str);
			if(parseObj['dtype'] && $.inArray(parseObj['dtype'] , ['soft','game']) != -1) {
				parseObj['url'] && result.push(parseObj['url']);
			}
		});
		return result;
 	}
	// 当前的发送到手机的href
	var currentSetupHref;
	var getInstallLinkHtml = function(type) {
		//数组的情况什么都不管了！		
		if(typeof currentSetupHref !== 'string') {
			return '';
		}
		var preTip ;
		switch(type) {
			case 'weishi':
				preTip = '暂不安装，';
				break;
			case 'zhushou':
				preTip = '暂不升级，';
				break;
			case 'macos':
				preTip = '';
				break;
		}
		monitorLog({
			mod : "dispdirectdownload",
			reason : type
		});
		//字符串的情况提供手动下载链接
		var parse = parseURL(currentSetupHref);
		var url = parse.url;
		if(url.indexOf('pdown://') != -1) {
			url = url.substring(url.lastIndexOf('http://'));
		}
		var html = '<div class="sub-text inslocal' +　(type === 'macos' ? ' macos' : '') +'">' + preTip + '直接&nbsp;&nbsp;<a target="_blank" href="' + url + '" data-setuplog="download-' + type + '">下载到本地</a></div>';
		return html;
	};
	var ZS = {},    
		isIE = $.browser.msie,
		referrer = document.referrer,
		iframe,
		// 打点统计
		monitorLog = function(data) {
			if (typeof window.monitor === 'object' && monitor !== null) {
				data = data || {};
				var extData = {};
				if (typeof monitor.data.getBaseExt === 'function') {
					extData = monitor.data.getBaseExt();
				}
				monitor.setConf('clickMMUrl', 'http://s.360.cn/so/click.gif').log($.extend({pro: pro, pid: pid, ver: ABTest.getType()}, data, extData), 'clickMM');
			}
		},
		versionCompare = function(v1, v2) {
			var v1s = v1.split( '.' ),
				v2s = v2.split( '.' ),
				len1 = v1s.length,
				len2 = v2s.length;
			for (var i = 0; i < len1; i++) {
				// V1前面和V2都相同，但是V1后面还有数字，说明V1版本更高
				if (i > len2 - 1) {
					return 1;
				}
				
				if (v1s[i] > v2s[i]) {
					return 1;
				} else if (v1s[i] < v2s[i]) {
					return -1;
				}
			}
			
			// V1前面和V2都相同，但是V2后面还有数字，说明V2版本更高
			if (len1 < len2) {
				return -1;
			}
			
			return 0;
		},
		// 插件及助手客户端接口部分
		MMClient = {
		
			// 检测到网盾存在或者插件存在，就认为安装了卫士
			isWeishiInstalled : function() {
				return window.wdextcmd || this.getSMActiveX() || this.isNPExist();
			},

			// 检测非IE浏览器下是否存在插件
			isNPExist : function() {
				var pluginName  = '360MMPlugin'.toLowerCase(),
				plugins = window.navigator.plugins;

				for (var i = 0, len = plugins.length; i < len; i++) {
					var item = plugins[i];
					if (item.name.toLowerCase() == pluginName) {
						return item;
					}
				}

				return false;
			},

			getPlugin : function(passwd) {
				return window.ActiveXObject ? this.getIP(passwd) : this.getNP();
			},

			// 检测软件管家接口
			getSMActiveX : function() {
				var myObject = document.createElement('object');
				
				myObject.classid= "clsid:467B32FF-C688-40FF-95FC-C7C61247B0AA"; 
				try {
					myObject.GetVersion();
					return myObject;
				} catch(e) {
					return false;
				}
			},        
			
			// 获取IE插件
			getIP : function(passwd){
				if (!passwd && window.wdextcmd && typeof wdextcmd.Call360MobileMgr != "unknown"){
					return {
						iswd: !0,
						target: window.wdextcmd
					};
				} else {
					var e = document.createElement("object");
					// IE8，新安装完卫士、不重启浏览器，IE8出黄色提示条：“加载项”。报错：“ 拒绝访问。”
					// 运行后，还是检测不到
					e.classid = "clsid:467B32FF-C688-40FF-95FC-C7C61247B0AA";
					return e;
				}
			},

			// 获取非IE插件
			getNP : function() {
				if( !this.embed ){
					this.createEmbed();
				}

				return this.embed;
			},

			createEmbed : function() {
			  var div = $( '<div style="visibility:hidden;position:absolute;z-index:-1;top:-100px;"/>' );
			  var embed;

			  embed = document.createElement( 'embed' );
			  embed.id = 'pluginId';
			  embed.type = 'application/x360mmplugin';

			  div.append( embed );
			  div.appendTo( document.body );
			  div = null;

			  this.embed = embed;
			},

			gotoProtocol : function(href){
				if( isIE6 ){
					if( !iframe ){
						iframe = $( '<iframe id="zsp_LinkRouter" name="zsp_LinkRouter" frameborder="0" tabindex="-1" style="border:0 none;filter:alpha(opacity=0)"/>' );
						iframe.appendTo( document.body );
					}
					
					iframe[0].src = href;
				}
				else{
					setTimeout(function(){
						window.location.href = href;
					}, 100 );
				}
			},
			
			// (置顶/取消置顶)助手
			top : function( status ){
				return;
				// -topon : 置顶
				// -topoff : 取消置顶
				var param = '-topon',
					plugin, version;

				if( MMClient.isWeishiInstalled() ){
					try{
						plugin = MMClient.getPlugin();
					}
					catch( e ){
						return;
					}
					
					version = ZS.version !== undefined ? ZS.version : MMClient.getVersion();
					
					// 助手版本号大于等于2.0.0.2140时才支持置顶功能
					if( !version || ZS.version < 2140 ){
						return;
					}
					
					// IE
					if( plugin.iswd ){
						plugin.target.Call360MobileMgr( param, '' );
					}
					// 非IE
					else{
						try{
							plugin.CallMobileMgrWithParam( param );
						}
						catch( e ){}
					}
				}
			},
			
			// 获取手机助手的版本号
			// 返回字符串 或者 null 或者 undefined
			getVersion : function(){
				var version = null;

				if( MMClient.isWeishiInstalled() ){
					try {
						plugin = MMClient.getPlugin();
						plugin = (plugin.iswd && plugin.target) || plugin;
						// 安装了卫士，没有安装手助，返回 undefined
						return plugin.Get360MobileMgrVer(0);
					} catch( e ) {
					}
				}
					
				if( ZS ){
					ZS.version = version;
				}
				
				return version;
			}
		},
		checkPlugin = function() {
			// 没有安装卫士
			if (!MMClient.isWeishiInstalled()) {
				NotificationManager.mmNotInstalled();
				return {code: 1};
			}
			
			var version = MMClient.getVersion();
			// console.log('version: ', version);
			if (!version) {
				NotificationManager.mmTooOld();
				return {code: 2};
			}

			// 小于2185的情况下，
			if (versionCompare(version, '2.0.0.2185') < 0) {
				setTimeout(function() {
					NotificationManager.mmTooOld();
				}, 1);
				return {code: 2, version: version};
			}
			
			// 获取IE插件或非IE插件
			var plugin;
			try {
				plugin = MMClient.getPlugin();
				return {code: 0, plugin: plugin};
			} catch( e ) {
				NotificationManager.mmTooOld();
				return {code: 2};
			}
		},
		wakeup = function() {
			var param = '-cmwnd /leidian',
				checkResult = checkPlugin();
			
			// 如果没有安装正确的环境
			if (checkResult.code !== 0 || !checkResult.plugin) {
				return false;
			}

			var plugin = checkResult.plugin;

			// IE
			if (plugin.iswd) {
				plugin.target.Call360MobileMgr( param, '' );
				// 让助手置顶 TODO 会不会不小心让小窗置顶了？还是先去掉安全。
				// MMClient.top();
				// 测试结果，在IE6下第一次打开不会置顶（亲测IE8无此问题，也可能和别的环境有关）
				if (isIE6) {
					plugin.target.Call360MobileMgr( '-topon', '' );
				}
			// 非IE
			} else {
				// 1. IE下,如果助手未安装,读取CallMobileMgrWithParam会抛异常
				// 2. 非IE下, 安装了NP插件但未安装助手时, 调用CallMobileMgrWithParam会没反应
				if (plugin.CallMobileMgrWithParam) {
					try {
						plugin.CallMobileMgrWithParam( param);
						// 让助手置顶 TODO 会不会不小心让小窗置顶了？还是先去掉安全。
						// MMClient.top();
						/*
						try {
							plugin.CallMobileMgrWithParam( '-topon' );
						} catch( e ) { }
						*/

						// 插件存在，但是助手未安装
						if (plugin.Is360MobileMgrInstalled && !plugin.Is360MobileMgrInstalled()) {
							NotificationManager.mmNotInstalled();
							return false;
						}
					} catch(e) {
					}
				} else {
					NotificationManager.mmNotInstalled();
					return false;
				}
			}

			return true;
		},
		// 批量安装
		multi = function( href ){
			href = distinct( href );
			if( MMClient.isWeishiInstalled() ){
				var plugin = MMClient.getPlugin();
				plugin = (plugin.iswd && plugin.target) || plugin;
				
				try {
					var isTop = false;
					//统计软件、游戏到中窗的量
					var allResources = [];
					while (href.length > 0) {
						var arr = href.splice(0, 30);
						var tmp = arr.join( '\n-e ' );
						plugin.Call360MobileMgr_LP('-e ' + tmp + '\n', '');
						if (!isTop) {
							isTop = true;
							// 让助手置顶
							MMClient.top(); 
						}
						allResources = allResources.concat(getApkUrls(arr));
					}
					if(allResources.length) {
						monitorLog({mod: 'install_urls', install_urls : allResources.join('##')});
					}
				}
				catch(e){}
			}
		},
		formatUrl = function(url) {
			if (typeof url !== 'string') {
				return '';
			}
			return url.replace(/(name=[^&]*)/, function(str, p1) {return p1 + '&quiet=1&src=leidian';});
		},
		key = 'favorites',
		favorites = [],
		setFavorites = function(val) {
			if (!val) {
				val = [];
			}
			favorites = val;
			saveData();
		},
		loadFavorites = function(val) {
			if (!val) {
				val = [];
			}
			
			favorites = [];
			for (var i = 0, l = val.length; i < l; i++) {
				if (val[i].substr(0, 13) === 'zhushou360://') {
					favorites.push(val[i]);
				}
			}
			// 更新数字
			updateNum(favorites.length);
		},
		number = 0,
		updateNum = function(num, firstTime) {
			// console.log('更新数字: ' + '从' + number + '到' + num);
			if (num == 0) {
				number = num;
				// 把数字都滚动到0
				$('.leidoudou-num ul').scrollTop(0).hide();
				$('.leidoudou-num').hide();
				return;
			}
			
			$('.leidoudou-num').show();
			// 是否初始化，默认为false
			if (firstTime === undefined) {
				firstTime = false;
			}

			// 逻辑上没有减少或者不变
			if (number >= num) {
				return;
			}

			// 把旧数字前面补上0，和新数字一样长
			var oldDigits = (('' + Math.pow(10, (('' + num).length - ('' + number).length))).substr(1) + number).split(''),
				newDigits = String.prototype.split.call(num, ''),
				len = oldDigits.length;

			$('.leidoudou-num').css('width', len * 8);
			// console.log('旧数字:', oldDigits, '新数字:', newDigits);
			for (var i = len - 1; i >= 0; i--) {
				var $ul = $('.leidoudou-num ul:eq(' +  (3 - (len - 1 - i) - 1) + ')');
				$ul.show();
				// console.log((len - 1 - i) + '位数，从' + oldDigits[i] + '到' + newDigits[i]);
				(function($ul, i) {
					// 没有进位
					if (newDigits[i] > oldDigits[i]) {
						// console.log((len - 1 - i) + '位数，没有进位', $ul);
						$ul.animate({scrollTop: 16 * newDigits[i]}, 500);
					// 有进位，先变到9，立即跳到0，再变到目的
					} else if (newDigits[i] < oldDigits[i]) {
						// console.log((len - 1 - i) + '位数，有进位', $ul);
						$ul.animate({scrollTop: 16 * 10}, 400, function() {
							$ul.scrollTop(0);
							$ul.animate({scrollTop: 16 * newDigits[i]}, 400);
						});
					}
				})($ul, i);
			}

			number = num;
		},
		clearFavorites = function() {
			favorites = [];
			dataSource.save();
			updateNum(0);
		},
		addCount = 0,
		timerId = null,
		talk = function(i, ttl) {
			// 默认为 5 秒
			if (ttl === undefined) {
				ttl = 5;
			}

			var className = 'leidoudou-talk leidoudou-talk' + i;
			if (isIE6) {
				className += ' pngfix';
			}
			$('.leidoudou-talk')[0].className = className;
			$('.leidoudou-talk').show();

			// 倒计时自动关闭
			clearTimeout(timerId);
			if (ttl > 0) {
				timerId = setTimeout(function() {
					if (ttl == 0) {
						hideTalk();
						return;
					}

					ttl--;
					timerId = setTimeout(arguments.callee, 1000);
				}, 1000);
			}
		},
		talk1ForEver = false,
		isTalk1ForEver = function() {
			return talk1ForEver && $('.leidoudou-talk').hasClass('leidoudou-talk1') && $('.leidoudou-talk').is(':visible');
		},
		// 手动关闭【永久气泡】“点击小手机，就可以装进你的手机啦！”，需要记录Cookie
		setCloseTalk1IfNeeded = function() {
			if (isTalk1ForEver()) {
				document.cookie = 'lddTalked1Closed=1; expires=Tue, 19 Jan 2038 03:14:07 GMT; path=/; domain=.leidian.com';
				talk1ForEver = false;
			}
		},
		hideTalk = function() {
			$('.leidoudou-talk')[0].className = 'leidoudou-talk';
			$('.leidoudou-talk').hide();
			clearTimeout(timerId);
		},
		doAdd = function(href) {
			if (!isTalk1ForEver()) {
				hideTalk();
			}

			/*
			// 第一次添加，弹出talk1，并且记录在cookie，以后不在弹出
			if (addCount === 0 && !document.cookie.match(/lddTalked1/)) {
				document.cookie = 'lddTalked1=1; expires=Tue, 19 Jan 2038 03:14:07 GMT; path=/; domain=.leidian.com';
				talk(1);
			*/
			var talk1 = false; // 记录是否弹出气泡1，用于判断重复气泡的显示逻辑
			// 当前页面的第一次添加动作，需要判断是否出气泡提示
			if (addCount === 0) {
				// 用户没有主动关闭过气泡，则出气泡且不会自动消失（只允许被其他气泡打断 5 秒）
				if (!document.cookie.match(/lddTalked1Closed=/)) {
					talk(1, 0);
					talk1 = true;
					talk1ForEver = true;
					// 被其他气泡打断 5 秒后，需要能恢复【永久气泡】“点击小手机，就可以装进你的手机啦！”
					var foreverTimer = setInterval(function() {
						// 已经清除了【永久气泡】
						if (!talk1ForEver) {
							clearInterval(foreverTimer);
							return;
						}

						// 正在显示任意一种气泡
						if ($('.leidoudou-talk').is(':visible')) {
							return;
						}

						talk(1, 0);
					}, 1000);
				// 用户主动关闭过气泡且为浏览器 Session 内的第一次添加
				} else if (!document.cookie.match(/lddTalked1=/)) {
					talk(1);
					talk1 = true;
					document.cookie = 'lddTalked1=1; path=/; domain=.leidian.com';
				}
			// 每隔5次，弹出
			} else if ((addCount + 1) % 5 === 0) {
				talk(2);
			}

			// 把消重后的URL加入数组
			var formattedUrl,
				newCount = 0;
			if( typeof href === 'string' ){
				formattedUrl = formatUrl(href);
				if ($.inArray(formattedUrl, favorites) == -1) {
					favorites.push(formattedUrl);
					newCount++;
				}
			} else if ( $.isArray(href) ) {
				for (var i = 0, l = href.length; i < l; i++) {
					formattedUrl = formatUrl(href[i]);
					if ($.inArray(formattedUrl, favorites) == -1) {
						favorites.push(formattedUrl);
						newCount++;
					}
				}
			}

			addCount++; // 重复的也算一次添加，否则在【永久气泡】的时候，怎么重复都不会提示了
			// 如果有新增的
			if (newCount > 0) {
				//saveData();
				dataSource.save();
				// 更新数字
				updateNum(favorites.length);
			// 如果没有新增的，那么肯定是因为重复了
			} else {
				// 如果第一次就重复了，忽略重复气泡
				if (!talk1) {
					talk(3);
				}
			}
			// 打点统计
			monitorLog({mod: 'doudou_add', cnt: newCount, code: 0});
		},
		animTimer = null,
		animating = false,
		restartAnim = function() {
			// 如果不在做动画，则启动动画
			if (!animating) {
				// $.doudou.trigger('start');
				$.doudou[0].start();
				animating = true;
			}
			// 重置动画结束的定时器
			clearTimeout(animTimer);
			animTimer = setTimeout(function() {
				// $.doudou.trigger('stop');
				$.doudou[0].stop();
				animating = false;
			}, 1000);
		},
		addToFavorites = function(href, e) {
			var newCount = typeof href === 'string' ? 1 : ($.isArray(href) ? href.length : 0);
			// 如果是非Windows操作系统，弹窗提示
			if (!/windows/i.test(navigator.userAgent)) {
				NotificationManager.notWindows();
				// 打点统计
				monitorLog({mod: 'doudou_add', cnt: newCount, code: 3});
				return;
			}
			
			// 如果有任务，则只检查助手是否安装以及版本是否太低，不单独调起中窗
			var checkResult = checkPlugin();
			if (checkResult.code !== 0 || !checkResult.plugin) {
				// 打点统计
				var monitorObj = {mod: 'doudou_add', cnt: newCount, code: checkResult.code};
				if(checkResult.code === 2) {
					monitorObj.version = checkResult.version || 0;
				}
				monitorLog(monitorObj);
				return false;
			}

			e = e || window.event || getEvent();
			if (!e) {
				doAdd(href);
				return;
			}
			// 默认icon，没有icon或者批量安装的时候使用
			// /static/img/setup_sprites.png
			var icon = null;
			// 从安装URL提取icon
			if( typeof href === 'string' ){
				var match = href.match(/&icon=([^&]+)/);
				// 没有icon时，有些URL填写的是icon=null，因此要做URL正确性判断
				if (match && match[1].substr(0, 7) == 'http://') {
					icon = match[1];
				}
			}

			if (!icon) {
				var id = location.host.split('.')[0];
				if (-1 === $.inArray(id, 'soft,game,ebook,music,ring,wallpaper,theme'.split(','))) {
					id = 'tag';
				}
				icon = 'http://theme.leidian.com/static/img/setup_ico_' + id + '.png';
			}

			// 为执行动画获取变量
			var initialSize = 62,
				halfInitialSize = initialSize / 2,
				destSize = 13,
				halfDestSize = destSize / 2,
				offset = $('.leidoudou-phone-center').offset(),
				// 手机中心点距离Viewport的距离
				targetPointX = offset.left - $(document).scrollLeft(),
				targetPointY = offset.top - $(document).scrollTop();

			// IE6采取的方案是，用 expression 模拟一个 position: fixed; 的div。
			// 然后动画作为这个 div 的子元素，以这个 div 为目标运动。
			if (isIE6) {
				 // 图片的起始位置（相对Viewport）
				var initialLeft = e.clientX - halfInitialSize - targetPointX,
					initialTop = e.clientY - halfInitialSize - targetPointY,
					destLeft = -halfDestSize - 1,
					destTop = -halfDestSize,
					distance = Math.pow( Math.pow(initialTop - destTop, 2) + Math.pow(initialLeft - destLeft, 2) , .5),
					duration = Math.max(400, Math.min(distance * 1.5, 1000));

				// 创建执行动画的图标
				// var $img = $('<img class="leidoudou-anim-icon" src="' + icon + '" />').css({
				var $div = $('<div style="background:none; filter:progid:DXImageTransform.Microsoft.AlphaImageLoader(src=\''+icon+'\', sizingMethod=\'scale\');" class="leidoudou-anim-icon"></div>').css({
					left: initialLeft,
					top: initialTop
				}).appendTo('.leidoudou-phone-center');

				// 开始执行动画
				$div.animate({
					top: destLeft,
					left: destTop,
					width: destSize,
					height: destSize
				}, duration, 'swing', function() {
					restartAnim();
					// 先移除图片，再添加，显得更流畅
					$div.remove();
					doAdd(href);
				});
			// 非 IE6，直接将 img 元素作为 body 的子元素，fixed定位。
			// 但是，为了处理360极速浏览器的“彗星尾巴”，而使用了 step 方法。
			// 为什么其中一版 setTimeout 套 setTimeout 的没有这个问题呢？
			} else {
				// 创建执行动画的图标
				var initialLeft = e.clientX - halfInitialSize,
					initialTop = e.clientY - halfInitialSize,
					destLeft = targetPointX - halfDestSize,
					destTop = targetPointY - halfDestSize,
					distance = Math.pow( Math.pow(destLeft - initialLeft, 2) + Math.pow(destTop - initialTop, 2) , .5),
					duration = Math.max(400, Math.min(distance * 1.5, 1000));

				var $img = $('<img class="leidoudou-anim-icon" src="' + icon + '" />').css({
					left: initialLeft,
					top: initialTop,
					widows: 1
				}).appendTo(document.body);

				// 开始执行动画
				// 在360极速浏览器下，高宽为浮点数时，会出现“彗星尾巴”。
				// 所以不让jQuery动画操作高宽。又因为jQuery动画能操作的属性只能是数字，所以scale无法代替。
				// 最终，必须在step函数里处理图片大小变化。又借助了打印属性widows来辅助计算属性的值。
				// step中可以改变scale，也可以改变高宽，但自己控制不出现浮点数就行了。
				$img.animate({
					top: destTop,
					left: destLeft
					// widows: destSize / initialSize
				}, {
					duration: duration,
					easing: 'swing',
					step: function(now, fx) {
						 // widows 在 FF下不行
						 /*
						if (fx.prop === 'widows') {
							console.log(fx);
							return;
							// $img.css('webkitTransform', 'scale(' + now + ')');
							// var size = initialSize * now; // “彗星尾巴”
							// var size = Math.floor(initialSize * now);
						}
						*/
						if (fx.prop == 'left') {
							// 第一次运行时 > 1
							if (fx.pos < 0 || fx.pos > 1) {
								return;
							}
							var size = Math.floor(initialSize - fx.pos * (initialSize - destSize));
							$img.css({width: size, height: size});
						}
					},
					complete: function() {
						restartAnim();
						$img.remove();
						doAdd(href);
					}
				});
			}

			return false;
		},
		sendFavorites = function() {
			
			setCloseTalk1IfNeeded();
			hideTalk();
			
			// 如果是非Windows操作系统，弹窗提示
			if (!/windows/i.test(navigator.userAgent)) {
				NotificationManager.notWindows();
				// 打点统计
				monitorLog({mod: 'doudou', cnt: 0, code: 3});
				return;
			}

			// 首先检查助手是否安装以及版本是否太低
			var checkResult = checkPlugin();
			if (checkResult.code !== 0 || !checkResult.plugin) {
				// 打点统计
				var logData = {mod: 'doudou', cnt: tmp.length, code: checkResult.code};
				if(checkResult.code === 2) {
					logData.version = checkResult.version || '0';
				}
				monitorLog(logData);
				return false;
			}
			
			// 如果没有需要安装的，则只调起中窗
			if (favorites.length === 0) {
				wakeup();
				// 打点统计
				//monitorLog({mod: 'doudou', cnt: 0, code: 0});
				//这个打点只是统计单击了雷逗逗
				monitorLog({mod: 'doudou_none', cnt: 0});

				return true;
			}

			var tmp = favorites.concat();
			clearFavorites();
			// 打点统计
			monitorLog({mod: 'doudou', cnt: tmp.length, code: 0});

			// 孟凡磊(13811288797): 如果有任务的话，就别调用 -cmwnd /leidian  这个参数了
			// wakeup();
			var ret;

			ret = multi(tmp);
			return ret;
		},
		// 直接发送到中窗
		send = function(href, e) {
			if (typeof href === 'string') {
				href = [href];
			}

			if (!$.isArray(href) || href.length === 0) {
				return false;
			}
			
			var len = href.length;
			for (var i = 0; i < len; i++) {
				href[i] = formatUrl(href[i]);
			}

			// 如果是非Windows操作系统，弹窗提示
			if (!/windows/i.test(navigator.userAgent)) {
				NotificationManager.notWindows();
				monitorLog({mod: 'doudou', cnt: len, code: 3});
				return false;
			}

			// 首先检查助手是否安装以及版本是否太低
			var checkResult = checkPlugin();
			if (checkResult.code !== 0 || !checkResult.plugin) {
				// 打点统计
				var logData = {mod: 'doudou', cnt: len, code: checkResult.code};
				if(checkResult.code === 2) {
					logData.version = checkResult.version || '0';
				}
				monitorLog(logData);
				return false;
			}

			// 打点统计
			monitorLog({mod: 'doudou', cnt: len, code: 0});
			return multi(href);
		},
		// 对批量安装中可能出现的name字段重名进行添加随机数的唯一性处理
		distinct = function( arr ){
			var str = 'name=',
				reg = /name=([^&]+)&/,
				len = arr.length,
				obj = {},
				i = 0,
				startIndex, endIndex, item, name;
				
			for( ; i < len; i++ ){
				item = arr[i];
				startIndex = item.indexOf( str );
				endIndex = item.indexOf( '&', startIndex );
				
				if( !~endIndex ){
					endIndex = item.length;
				}
				
				name = item.slice( startIndex + 5, endIndex );
				
				if( !obj[name] ){
					obj[ name ] = true;
				}
				else{
					name += '_' + ( (Math.random() + '').slice(-8) - 0 + (+new Date()) ).toString(36);
					obj[ name ] = true;
					item = item.replace( reg, function( $, $1 ){
						return 'name=' + name + '&';
					});
					arr[i] = item;
				}
			}    

			return arr;
		};
		window.updateNum = updateNum;
	function getEvent() {
		var o = arguments.callee;
		var e;
		do {
			e = o.arguments[0];
			if (e && (e.constructor == Event || e.constructor == MouseEvent || e.constructor == KeyboardEvent)) {
				return e;
			}
		} while (o = o.caller);
		return e;
	}
	var Cookie = {
		get : function(key) {
			try {
				var a, reg = new RegExp("(^| )" + key + "=([^;]*)(;|$)");
				if(a = document.cookie.match(reg)){
					return unescape(a[2]);
				}else{
					return "";
				}
			} catch(e) { 
				return "";
			}
		}
	} 
	var ABTest = {
		types: {},
		type: null,
		init: function() {
			if (!this.type) {
				this.type = this.getType();
			}
		},
		getType: function() {
			if (this.type) {
				return this.type;
			}
			return 'B';
			/*
			// 无法获取 GUID ，返回默认方案A方案
			if (typeof window.monitor !== 'object') {
				return 'A';
			}

			try {
				var guid = Cookie.get('__guid'),
					parts = guid.split('.'),
					num = parts.pop();

				// 如果 GUID 最后部分不是全数字，则使用 A 方案
				if (!/^\d+$/.test(num)) {
					return 'A';
				}
				
				var mod = num % 10;
				if ($.inArray(mod,[4,5,6,7]) != -1) {
					return 'B';
				} else {
					return 'A';
				}
			} catch (e) {
				return 'A';
			}

			// 如果有任何错误，还是返回默认方案A方案
			return 'A';
			*/
		},
		run: function() {
			//保存当前的发送地址
			currentSetupHref = arguments[1];
			//
			type = Array.prototype.shift.call(arguments) || this.getType();
			try {
				ABTest.types[type].apply(null, arguments);
			} catch(e) {}
		}
	}

	// A: 添加都雷豆逗
	ABTest.types.A = function() {
		addToFavorites.apply(null, arguments);
	}
	// B: 直接发送到中窗
	ABTest.types.B = function() {
		send.apply(null, arguments);
	}
	try {
		var oldGetBase = monitor.data.getBase;
		monitor.data.getBase = function() {
			var oldBase = oldGetBase();
			oldBase.ver = ABTest.getType();
			//保证ver有值。
			if(!oldBase.ver) {
				oldBase.ver = 'A';
			}
			if(monitor.data.getPageRef) {
				oldBase.ref = monitor.data.getPageRef();
			}
			return oldBase;
		}
	} catch(e) {}
	
	window.doudouABTest = ABTest.getType;
	
	// 为手机助手提供网页调用的公用接口
	ZS = {    

		// 调用手机助手
		// callMM : callMM,
		callMM : function(href) {
			// console.log(arguments.callee.caller);
			// #bt-multi-install .mod-topic-setup
			// addToFavorites(href);
			ABTest.run(null, href, null);
		},
		sendFavorites: sendFavorites,
		
		// 回调函数接口，只要支持批量安装就会执行回调
		multiSetup : function( fn ){
			setTimeout(fn, 10);
			// setTimeout(function(){
		//		fn();
				// 现在不需要判断版本号了
				/*
				var version = MMClient.getVersion();

				// 助手版本号大于等于2.0.0.2110时才支持批量安装
				/*
				if( version && version >= 2110 && typeof fn === 'function' ){
					fn();
				}
				*/
		//	}, 1000 );
		}
		
		/* 
		 * 手机助手的版本号，该版本号会最晚会延迟1000毫秒才会生成
		 * version : xxx
		 */
		
	};

	window.ZS = ZS;

	window.inited = function(name) {
		loadFavorites(name.split('|$|'));
		dataSource.refresh();
	}
	window.refreshed = function(name) {
		loadFavorites(name.split('|$|'));
		dataSource.refresh();
	}
	window.saved = function() {
		dataSource.refresh();
	}

	var dataSource = {
		initUrl: 'http://www.leidian.com/store.html#action=init',
		refreshUrl: 'http://www.leidian.com/store.html#action=refresh',
		saveUrl: location.protocol + '//' + location.host + '/proxy.html',
		$iframe: null,
		iframe: null,
		name: null,
		navigate2: function(url, onload) {
			if (this.$iframe) {
				this.iframe.onload = null;
				this.$iframe.remove();
			}
			
			if (onload) {
				window.setupIframeOnload = onload;
				this.$iframe = $('<iframe src="' + url + '" width="0" height="0" frameborder="0" tabindex="-1" style="display:none;" onload="if (window.setupIframeOnload) setupIframeOnload()"></iframe>').appendTo(document.body);
			} else {
				this.$iframe = $('<iframe src="' + url + '" width="0" height="0" frameborder="0" tabindex="-1" style="display:none;"></iframe>').appendTo(document.body);
			}
			this.iframe = this.$iframe.get(0);
		},
		init: function() {
			this.navigate2(this.initUrl, null);
		},
		refresh: function() {
			this.navigate2(this.refreshUrl, null);
		},
		save: function() {
			this.navigate2(this.saveUrl, function() {
				// 避免两次 replace后再次onload 无效
				dataSource.iframe.onload = null;
				// 避免两次 replace后再次onload
				window.setupIframeOnload = null;
				dataSource.iframe.contentWindow.name = favorites.join('|$|');
				dataSource.iframe.contentWindow.location.replace('http://www.leidian.com/store.html#action=save');
			});
		}
	}

	function init() {
		NotificationManager.init();
		//dataSource.init();

		var css = '<style type="text/css">'
			+ '.setup_dialog {display: none;left: 50%;margin: -165px 0 0 -236px;position: fixed;top: 50%;z-index: 100001;}'
			+ '.setup_dialog .dg_wrapper {background: #fff;border: 1px solid #ccc;box-shadow: 0 0 10px rgba(0,0,0,0.4);color: #333;position: relative;width: 470px;}'
			+ '.setup_dialog .dg_btn_close, .setup_dialog h4, .setup_dialog .download_zhushou, .setup_dialog .dg_content .ie_img, .setup_dialog .dg_content .noneie_img {background: url(http://p6.qhimg.com/t01c474c1ca042d6b62.png) no-repeat 0 0;}'
			+ '.setup_dialog .dg_btn_close {background-position: 4px -151px;display: block;height: 20px;overflow: hidden;position: absolute;right: 6px;text-indent: -999em;top: 6px;width: 20px;}'
			+ '.setup_dialog .dg_header {background: #f9f9f9;border-bottom: 1px solid #f0f0f0;font-size: 14px;font-weight: 400;font-family: "Microsoft yahei",arial;height: 32px;line-height: 32px;text-indent: 10px;}'
			+ '.setup_dialog .dg_content {padding: 20px 28px 0;}'
			+ '.leidoudou {cursor: pointer;position: relative;z-index: 1;overflow: visible !important;}'
			// IE6透明层不能点击的Bug 导致IE6下，overflow: hidden; 数字显示不全（上边和右边都有）
			// 【IE6的疯狂系列】IE6下使用滤镜后链接不能点击的BUG http://www.css88.com/archives/2916
			+ '.leidoudou .leidoudou-click-area {cursor: pointer; width: 100%;height: 100%;*height: 999px; position: absolute; z-index: 99999;background: #fff;filter: alpha(opacity=0); opacity: 0;}'
			+ '.leidoudou .leidoudou-num {width: 30px;cursor: pointer;display: none; background: #f36e5d; color: #fff; padding: 0 3px; height: 16px; line-height: 16px; text-align: center; position: absolute; left: 50px; top: -12px; border-radius: 4px;}'
			+ '.leidoudou .leidoudou-num ul {display: none; height:100%; overflow: hidden; float: left;text-align: center;width: 8px;}'
			+ '.leidoudou-phone-center .leidoudou-talk {position: absolute;}'
			+ '.leidoudou-phone-center .leidoudou-talk0 {top: 25px; right: -104px; width: 183px; height: 115px; background: url(http://theme.leidian.com/static/img/setup_talk0.png) center no-repeat;}'
			+ '.leidoudou-phone-center .leidoudou-talk1 {top: 25px; right: -104px; width: 183px; height: 115px; background: url(http://theme.leidian.com/static/img/setup_talk1.png) center no-repeat;}'
			+ '.leidoudou-phone-center .leidoudou-talk2 {top: 25px; right: -80px; width: 149px; height: 96px; background: url(http://theme.leidian.com/static/img/setup_talk2.png) center no-repeat;}'
			+ '.leidoudou-phone-center .leidoudou-talk3 {top: 25px; right: -80px; width: 149px; height: 96px; background: url(http://theme.leidian.com/static/img/setup_talk3.png) center no-repeat;}'
			+ '.leidoudou-talk a {display: none; position: absolute; top: 23px; right: 6px; width: 19px; height: 19px; background: url(http://theme.leidian.com/static/img/setup_talk_close.png);}'
			+ '.leidoudou-talk0 a, .leidoudou-talk1 a, .leidoudou-talk2 a, .leidoudou-talk3 a {display: block;}'
			+ '.leidoudou-phone-center .leidoudou-talk0 a {right: 10px;}'
			+ '.leidoudou-phone-center .leidoudou-talk1 a {right: 12px;}'
			+ '.leidoudou-phone-center .leidoudou-talk a:hover {background-position: 0 -21px;}'
			+ '.leidoudou-anim-icon {position: fixed;*position: absolute; z-index: 16777271; width: 62px; height: 62px;}'
			+ '.setup {visibility: visible;}'
			+ '</style>';
		
		$(css).appendTo('head');

		// 添加360兔子到页面上，绑定事件
		// $favorite = $('.install-mascot').addClass('leidoudou');
		// $('.leidoudou-num').remove();
		// $('.ld-phone').prepend('<div class="leidoudou-num"></div>');
		// $('.leidoudou-num').prepend('<ul><li>0</li><li>1</li><li>2</li><li>3</li><li>4</li><li>5</li><li>6</li><li>7</li><li>8</li><li>9</li><li>0</li></ul>');
		// $('.leidoudou-num').prepend('<ul><li>0</li><li>1</li><li>2</li><li>3</li><li>4</li><li>5</li><li>6</li><li>7</li><li>8</li><li>9</li><li>0</li></ul>');
		// $('.leidoudou-num').prepend('<ul><li>0</li><li>1</li><li>2</li><li>3</li><li>4</li><li>5</li><li>6</li><li>7</li><li>8</li><li>9</li><li>0</li></ul>');
		// $('.leidoudou-num').prepend('<ul><li>0</li><li>1</li><li>2</li><li>3</li><li>4</li><li>5</li><li>6</li><li>7</li><li>8</li><li>9</li><li>0</li></ul>');
		// $('.leidoudou-num').prepend('<ul><li>0</li><li>1</li><li>2</li><li>3</li><li>4</li><li>5</li><li>6</li><li>7</li><li>8</li><li>9</li><li>0</li></ul>');

		// 根据雷豆逗的位置，设置$animWrapper的样式
		// 创建执行动画的父元素，为position: fixed; 从而动画的img元素可以使用position: absolute;
		// $phoneCenter = $('<div class="leidoudou-phone-center" style="position: fixed; *position: absolute;z-index: 16777270;/*width:10px;height:10px;background:red;*/"></div>').appendTo(document.body);
		// // 每次状态变化会触发两次change，其中一次的参数为undefined，忽略之
		// function change(args) {
		// 	// console.log('豆豆状态变化, 蹲下：' , args);
		// 	/* // TODO 先去掉，等 setup.js 放到上面
		// 	if (args === undefined) {
		// 		return;
		// 	}
		// 	*/

		// 	var offset = $('.ld-phone').offset(), 
		// 		left = offset.left + ($('.ld-phone').width() >> 1),
		// 		top = offset.top + ($('.ld-phone').height() >> 1);

		// 	if (isIE6) {
		// 		var css = '<style id="ie6-expression-setup" type="text/css">.leidoudou-phone-center {left: expression(' + (left - document.documentElement.scrollLeft) + '+eval(document.documentElement.scrollLeft)); top: expression(' + (top - document.documentElement.scrollTop) + '+eval(document.documentElement.scrollTop))}</style>';
		// 		$('#ie6-expression-setup').remove();
		// 		$(css).appendTo('head');
		// 	} else {
		// 		$phoneCenter.css({left: left - $(document).scrollLeft(), top: top - $(document).scrollTop()});
		// 	}
		// }
		// $.doudou[0].change = change;
		// $(window).on('resize', change);
		// // TODO 先去掉，等 setup.js 放到上面
		// change();
		// // change();
		// // 1. setInterval(change, 100);在IE6下跑满CPU，先去掉，虽然有可能change没有执行
		// // setInterval(change, 100);

		// // $('.leidoudou').prepend('<div class="leidoudou-click-area"></div>');
		// // 如果还有.leidoudou-talk，则先删除
		// $('.leidoudou-talk').remove();
		// $('.leidoudou-phone-center').append('<div class="leidoudou-talk"><a class="pngfix" href="javascript:void(0)"></a></div>');
		// $('.leidoudou-talk a').on('click', function(e) {
		// 	setCloseTalk1IfNeeded();
		// 	hideTalk();
		// });

		// $('.leidoudou').on('click', function(e) {
			
		// 	var flag = sendFavorites();
		// 	if ( !flag ) {
		// 		if(e && e.preventDefault){
		// 			e.preventDefault();
		// 		}else{
		// 			window.event.returnValue=false;
		// 		}
		// 		// NotificationManager.mmNotInstalled();
		// 	} else {
		// 		$('.leidoudou-anim-icon').remove();
		// 		if( typeof window.__setupSuccess__ === 'function' ){
		// 			window.__setupSuccess__();
		// 		}
		// 	}
		// });
		
		/* 此功能下线
		if (!document.cookie.match(/lddTalked0/)) {
			// expires=Tue, 19 Jan 2038 03:14:07 GMT;
			document.cookie = 'lddTalked0=1; path=/; domain=.leidian.com';
			// 第一次浏览器进程内，进入页面，弹出
			talk(0);
			// 3秒钟后，如果还显示，则自动关闭
			setTimeout(function() {
				$('.leidoudou-talk').removeClass('leidoudou-talk0');
			}, 3000);
		}
		*/
		// 绑定全局事件
		$( document ).on( 'click', 'a.setup', function( e ) {
			ABTest.run(null, this.href, e);

			return false;
		});

		// 绑定事件后，才显示“安装”按钮
		// 这种方案有问题，因为音乐频道是后弹出的 .setup
		// $('.setup').addClass('setup-show');

		// 仅在直接输入域名或者从第三方网站跳转过来时才会置顶
		// 如果是雷电网内部过来的链接不做置顶
		/*
		if( !referrer || !~referrer.indexOf('leidian.com') ){
			$(function(){
				setTimeout(function(){
					MMClient.top();
				}, 2000 );
			});     
		}
		*/
		//检测data-setuplog
		// $("#setupDialog").on('click' , '[data-setuplog]' , function(e) {
		// 	var target = e.currentTarget;
		// 	var logType = $(target).data('setuplog');
		// 	var map = {
		// 		'download-weishi' : {
		// 			mod : 'directdownload',
		// 			product : 'weishi'
		// 		},
		// 		'download-zhushou':{
		// 			mod : 'directdownload',
		// 			product : 'zhushou'
		// 		},
		// 		'download-macos' : {
		// 			mod : 'directdownload' , 
		// 			product : 'macos'
		// 		},
		// 		'install-zhushou' : {
		// 			mod : 'setupinstall',
		// 			product : 'zhushou'
		// 		}
		// 		/*
		// 		 //卫士安装成功
		// 		 mod : installsucc
		// 		 product : weishi
		// 		 //助手安装成功
		// 		 mod : installsucc
		// 		 product : zhushou
		// 		 //显示了含有“直接下载”的弹层的用户
		// 		 mod : "dispdirectdownload",
		// 		 reason : 'weishi'、'zhushou'、'macos'
		// 		 */
		// 	};
		// 	var data = map[logType];
		// 	if(data) {
		// 		monitorLog(data);
		// 	}
		// });
	}
	$(document).ready(init);
})();
