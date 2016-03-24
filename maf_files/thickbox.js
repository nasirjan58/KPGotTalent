
/*
* Thickbox 3.1 - One Box To Rule Them All.
* By Cody Lindley (http://www.codylindley.com)
* Copyright (c) 2007 cody lindley
* Licensed under the MIT License: http://www.opensource.org/licenses/mit-license.php
*/

var tb_pathToImage = g_img_url + "img/ajax-loader-circle-big-dark-bg.gif?v=2";

/*!!!!!!!!!!!!!!!!! edit below this line at your own risk !!!!!!!!!!!!!!!!!!!!!!!*/
//on page load call tb_init
jQuery(document).ready(function(){
	tb_init('a.thickbox, area.thickbox, input.thickbox');//pass where to apply thickbox
	imgLoader = new Image();// preload image
	imgLoader.src = tb_pathToImage;
});
//add thickbox to href & area elements that have a class of .thickbox
function tb_init(domChunk){
	jQuery(domChunk).click(function(){		
		var t = this.title || this.name || null;
		var a = this.href || this.alt;
		var g = this.rel || false;
		tb_show(t,a,g);
		this.blur();
		return false;
	});
}
function tb_show(caption, url, imageGroup) {//function called when the user clicks on a thickbox link
	try {
		if (typeof document.body.style.maxHeight === "undefined" ) {//if IE 6
			jQuery("body","html").css({height: "100%", width: "100%"});
			jQuery("html").css("overflow","hidden");
			if (document.getElementById("TB_HideSelect") === null) {//iframe to hide select elements in ie6
				jQuery("body").append("<iframe id='TB_HideSelect'></iframe><div id='TB_overlay'></div><div id='TB_window'></div>");
				jQuery("#TB_overlay").click(tb_remove);
			}
		}else{//all others
			//--------------------------------------------------------
			//added by hamid - to fix the ff3 on linux thickbox issue overlaying flash
			//alert(BrowserDetect.browser+"|"+BrowserDetect.version+"|"+BrowserDetect.OS);
			if( $j.browser.firefox && $j.browser.linux){
				if (document.getElementById("TB_HideSelect") === null) {//iframe to hide select elements in ie6
					jQuery("body").append("<iframe id='TB_HideSelect'></iframe><div id='TB_overlay'></div><div id='TB_window'></div>");
					jQuery("#TB_overlay").click(tb_remove);
				}
			}
			//END: added by hamid
			
			if(document.getElementById("TB_overlay") === null){	
				jQuery("body").append("<div id='TB_overlay'></div><div id='TB_window'></div>");
				jQuery("#TB_overlay").click(tb_remove);
			}
		}
		
		// Set Thickbox zIndex higher than Bootstrap if there is already a Bootstrap Modal on the page and Visible
		var bootstrapModal = jQuery('.modal.fade.in');
		if (bootstrapModal.length) {
			var zIndex = parseInt(bootstrapModal.css('zIndex'));
			jQuery("#TB_overlay").css('zIndex', zIndex + 5);
			jQuery("#TB_window").css('zIndex', zIndex + 10);
		}

		if(tb_detectMacXFF()){			
			jQuery("#TB_overlay").addClass("TB_overlayMacFFBGHack");//use png overlay so hide flash
		}else{
			jQuery("#TB_overlay").addClass("TB_overlayBG");//use background and opacity
		}

		if(caption===null){caption="";}
		jQuery("body").append("<div id='TB_load'><img src='"+tb_pathToImage+"' /></div>");//add loader to the page
		jQuery('#TB_load').show();//show loader

		var baseURL;
		if(url.indexOf("?")!==-1){ //ff there is a query string involved
			baseURL = url.substr(0, url.indexOf("?"));
		}else{
			baseURL = url;
		}

		var urlString = /\.jpg$|\.jpeg$|\.png$|\.gif$|\.bmp$/;
		var urlType = baseURL.toLowerCase().match(urlString);
		if(urlType == '.jpg' || urlType == '.jpeg' || urlType == '.png' || urlType == '.gif' || urlType == '.bmp'){//code to show images

			TB_PrevCaption = "";
			TB_PrevURL = "";
			TB_PrevHTML = "";
			TB_NextCaption = "";
			TB_NextURL = "";
			TB_NextHTML = "";
			TB_imageCount = "";
			TB_FoundURL = false;
			if(imageGroup){
				TB_TempArray = jQuery("a[@rel="+imageGroup+"]").get();
				for (TB_Counter = 0; ((TB_Counter < TB_TempArray.length) && (TB_NextHTML === "")); TB_Counter++) {
					var urlTypeTemp = TB_TempArray[TB_Counter].href.toLowerCase().match(urlString);
					if (!(TB_TempArray[TB_Counter].href == url)) {
						if (TB_FoundURL) {
							TB_NextCaption = TB_TempArray[TB_Counter].title;
							TB_NextURL = TB_TempArray[TB_Counter].href;
							TB_NextHTML = "<span id='TB_next'>&nbsp;&nbsp;<a href='#'>Next &gt;</a></span>";
						} else {
							TB_PrevCaption = TB_TempArray[TB_Counter].title;
							TB_PrevURL = TB_TempArray[TB_Counter].href;
							TB_PrevHTML = "<span id='TB_prev'>&nbsp;&nbsp;<a href='#'>&lt; Prev</a></span>";
						}
					} else {
						TB_FoundURL = true;
						TB_imageCount = "Image " + (TB_Counter + 1) +" of "+ (TB_TempArray.length);
					}
				}
			}
			imgPreloader = new Image();
			imgPreloader.onload = function(){
				imgPreloader.onload = null;

				// Resizing large images - orginal by Christian Montoya edited by me.
				var pagesize = tb_getPageSize();
				var x = pagesize[0] - 150;
				var y = pagesize[1] - 150;
				var imageWidth = imgPreloader.width;
				var imageHeight = imgPreloader.height;
				if (imageWidth > x) {
					imageHeight = imageHeight * (x / imageWidth);
					imageWidth = x;
					if (imageHeight > y) {
						imageWidth = imageWidth * (y / imageHeight);
						imageHeight = y;
					}
				} else if (imageHeight > y) {
					imageWidth = imageWidth * (y / imageHeight);
					imageHeight = y;
					if (imageWidth > x) {
						imageHeight = imageHeight * (x / imageWidth);
						imageWidth = x;
					}
				}
				// End Resizing

				TB_WIDTH = imageWidth + 30;
				TB_HEIGHT = imageHeight + 60;
				jQuery("#TB_window").append("<a href='' id='TB_ImageOff' title='Close'><img id='TB_Image' src='"+url+"' width='"+imageWidth+"' height='"+imageHeight+"' alt='"+caption+"'/></a>" + "<div id='TB_caption'>"+caption+"<div id='TB_secondLine'>" + TB_imageCount + TB_PrevHTML + TB_NextHTML + "</div></div><div id='TB_closeWindow'><a href='#' id='TB_closeWindowButton' title='Close'>&times;</a></div>");

				jQuery("#TB_closeWindowButton").click(tb_remove);

				if (!(TB_PrevHTML === "")) {
					function goPrev(){
						if(jQuery(document).unbind("click",goPrev)){jQuery(document).unbind("click",goPrev);}
						jQuery("#TB_window").remove();
						jQuery("body").append("<div id='TB_window'></div>");
						tb_show(TB_PrevCaption, TB_PrevURL, imageGroup);
						return false;
					}
					jQuery("#TB_prev").click(goPrev);
				}

				if (!(TB_NextHTML === "")) {
					function goNext(){
						jQuery("#TB_window").remove();
						jQuery("body").append("<div id='TB_window'></div>");
						tb_show(TB_NextCaption, TB_NextURL, imageGroup);
						return false;
					}
					jQuery("#TB_next").click(goNext);

				}
				document.onkeydown = function(e){
					if (e == null) { // ie
						keycode = event.keyCode;
					} else { // mozilla
						keycode = e.which;
					}
					if(keycode == 27){ // close
						tb_remove();
					} else if(keycode == 190){ // display previous image
						if(!(TB_NextHTML == "")){
							document.onkeydown = "";
							goNext();
						}
					} else if(keycode == 188){ // display next image
						if(!(TB_PrevHTML == "")){
							document.onkeydown = "";
							goPrev();
						}
					}
				};

				tb_position();
				jQuery("#TB_load").remove();
				jQuery("#TB_ImageOff").click(tb_remove);
				jQuery("#TB_window").fadeIn("fast");
				
			};

			imgPreloader.src = url;
		}else{//code to show html

			var queryString = url.replace(/^[^\?]+\??/,'');
			var params = tb_parseQuery( queryString );

			//TB_WIDTH = (params['width']*1) + 30 || 630; //defaults to 630 if no paramaters were added to URL
			//TB_HEIGHT = (params['height']*1) + 40 || 440; //defaults to 440 if no paramaters were added to URL

			//------------------------------------------------
			//added by yms
			/*
			determine screen height: added by YMS 28-09-2007
			instead of some default number, if height or width
			is missing, make it full height or width of the page
			------------------------------------------------
			use dimensions plugin instead (added by YMS 03-10-2007)
			*/
			TB_WIDTH = (params['width'])?(params['width']*1 + 30):(jQuery(window).width()-40); //defaults to full screen width if no paramaters were added to URL
			TB_HEIGHT = (params['height'])?(params['height']*1 + 40):(jQuery(window).height()-120); //defaults to full screen height if no paramaters were added to URL
			//END: yms - attempt fix for flipbook modals in ie6 and ie7
			
			//ajaxContentW = ( jQuery.browser.msie && !(window.g_inFlipbook === undefined) && g_inFlipbook===true && params['widgetAd'] === undefined )?TB_WIDTH:TB_WIDTH - 30;
			//YMS 2011-05-03: removal of IE adjustment
			if(params['class'] && params['class']=='nopadding'){
				ajaxContentW = TB_WIDTH;
			} else {
				ajaxContentW = TB_WIDTH - 30;
			}
			ajaxContentH = TB_HEIGHT - 45;
			
			
			if(url.indexOf('TB_iframe') != -1){// either iframe or ajax window
				urlNoQuery = url.split('TB_');
				jQuery("#TB_iframeContent").remove();
				if(params['modal'] != "true"){//iframe no modal
					jQuery("#TB_window").append("<div id='TB_title'><div id='TB_ajaxWindowTitle'>"+caption+"</div><div id='TB_closeAjaxWindow'><a href='#' id='TB_closeWindowButton' title='Close'>&times;</a></div></div><iframe frameborder='0' hspace='0' id='TB_iframeContent' src='' name='TB_iframeContent"+Math.round(Math.random()*1000)+"' onload='tb_showIframe()' style='width:"+(ajaxContentW + 29)+"px;height:"+(ajaxContentH + 17)+"px;' > </iframe>");
					
					var tb_iFrameContent = document.getElementById('TB_iframeContent'), nonBlockingTime = 0; // sets a buffer for iframe on load event
					if (navigator.userAgent.indexOf('Firefox')) {
						nonBlockingTime = 500; // firefox seems to report on loading blocking problems, which affects the functionality of the source that the iframe loads
					}
					setTimeout(function() { tb_iFrameContent.src = urlNoQuery[0]; }, nonBlockingTime);
					
				}else{//iframe modal
					jQuery("#TB_overlay").unbind();
					jQuery("#TB_window").append("<iframe frameborder='0' hspace='0' src='"+urlNoQuery[0]+"' id='TB_iframeContent' name='TB_iframeContent"+Math.round(Math.random()*1000)+"' onload='tb_showIframe()' style='width:"+(ajaxContentW + 29)+"px;height:"+(ajaxContentH + 17)+"px;'> </iframe>");
				}
			}else{// not an iframe, ajax
				if(jQuery("#TB_window").css("display") != "block"){
					if(params['modal'] != "true"){//ajax no modal
						jQuery("#TB_window").append("<div id='TB_title'><div id='TB_ajaxWindowTitle'>"+caption+"</div><div id='TB_closeAjaxWindow'><a href='#' id='TB_closeWindowButton'>&times;</a></div></div><div id='TB_ajaxContent' style='width:"+ajaxContentW+"px;height:"+ajaxContentH+"px'></div>");
					}else{//ajax modal
						jQuery("#TB_overlay").unbind();
						jQuery("#TB_window").append("<div id='TB_ajaxContent' class='TB_modal' style='width:"+ajaxContentW+"px;height:"+ajaxContentH+"px;'></div>");
					}
				}else{//this means the window is already up, we are just loading new content via ajax
					jQuery("#TB_ajaxContent")[0].style.width = ajaxContentW +"px";
					jQuery("#TB_ajaxContent")[0].style.height = ajaxContentH +"px";
					jQuery("#TB_ajaxContent")[0].scrollTop = 0;
					jQuery("#TB_ajaxWindowTitle").html(caption);
				}
			}
			
			// if param force_close=true, even if not a modal, force user to click the 'x'
			if(params['force_close'] == "true" && params['modal'] != "true"){
				jQuery("#TB_overlay").unbind();
			}
				
			jQuery("#TB_closeWindowButton").click(tb_remove);

			if(url.indexOf('TB_inline') != -1){
                var $html;
                var unloadThickboxCallback;
                var $children = jQuery('#' + params['inlineId']).children();
                if($children.length === 0) {
                    // Content of the element is a string representing HTML
                    var text = jQuery('#' + params['inlineId']).text();
                    $html = jQuery(text);
                    if($html.length === 0) {
                        $html = text;
                    }
                    unloadThickboxCallback = function () {
                        jQuery('#' + params['inlineId']).text( jQuery("#TB_ajaxContent").children().prop('outerHTML') ); // move elements back when you're finished
                    };
                } else {
                    // Content of the element is made of actual DOM elements
                    $html = $children;
                    unloadThickboxCallback = function () {
                        jQuery('#' + params['inlineId']).append( jQuery("#TB_ajaxContent").children() ); // move elements back when you're finished
                    };
                }
                
				jQuery("#TB_ajaxContent").append($html);
				jQuery("#TB_window").bind('unload.thickbox', unloadThickboxCallback);
				tb_position();
				jQuery("#TB_load").remove();
				jQuery("#TB_window").fadeIn("fast");
				
				
				//---------------------------
				//added by hamid
				//editted by rob s.
				tb_exec_callback('onload');
				//END: added by hamid
				
			}else if(url.indexOf('TB_iframe') != -1){
				tb_position();
				if($j.browser.safari){//safari needs help because it will not fire iframe onload
					jQuery("#TB_load").remove();
					jQuery("#TB_window").css({display:"block"});
				}
				
				//---------------------------
				//added by hamid
				//editted by rob s.
				tb_exec_callback('onload');
				//END: added by hamid
				
			}else{
				jQuery("#TB_ajaxContent").load(url += "&random=" + (new Date().getTime()),function(){//to do a post change this load method
					tb_position();
					jQuery("#TB_load").remove();
					tb_init("#TB_ajaxContent a.thickbox");
					jQuery("#TB_window").fadeIn("fast"); //fading in added by yms
					
					//---------------------------
					//added by hamid
					//editted by rob s.
					tb_exec_callback('onload');
					//END: added by hamid				
				});
			}
		}
		if(!params['modal']){
			document.onkeyup = function(e){
				if (e == null) { // ie
					keycode = event.keyCode;
				} else { // mozilla
					keycode = e.which;
				}
				if(keycode == 27){ // close
					tb_remove();
				}
			};
		}
		//addded by yoav - 2011-03-25
		// - ability to add class to TB_window
		if(params['class'])
			jQuery("#TB_window").addClass(params['class']);	
		//  end new addition //		
	
	} catch(e) {
		//nothing here
	}
}



//helper functions below
function tb_showIframe(){
	jQuery("#TB_load").remove();
	jQuery("#TB_window").css({display:"block"});
}
function tb_remove() {

	//----------------------------
	//added by Rob S.
	tb_exec_callback('onbeforeremove', true);
	//END: added by Rob S.
	
	jQuery("#TB_imageOff").unbind("click");
	
	jQuery("#TB_closeWindowButton").unbind("click");
	jQuery('#TB_overlay,#TB_HideSelect,#TB_window,#TB_ajaxContent').css('visibility', 'hidden').hide();
	jQuery('#TB_iframeContent').attr('src', 'about:blank');
	var msFlashObjTimeBuffer = navigator.userAgent.indexOf('MSIE') > 0 ? 50 : 0;
	setTimeout(function() { jQuery('#TB_window,#TB_overlay,#TB_HideSelect').trigger("unload.thickbox").unbind().remove(); }, msFlashObjTimeBuffer);
	jQuery("#TB_load").remove();
	
	if (typeof document.body.style.maxHeight == "undefined") {//if IE 6
		jQuery("body","html").css({height: "auto", width: "auto"});
		jQuery("html").css("overflow","");
	}
	
	document.onkeydown = "";
	document.onkeyup = "";

	//----------------------------
	//added by hamid
	//editted by rob s.
	tb_exec_callback('onremove', true);
	//END: added by hamid
	
	return false;
}
function tb_position() {
	jQuery("#TB_window").css({marginLeft: '-' + parseInt((TB_WIDTH / 2),10) + 'px', width: TB_WIDTH + 'px'});
	if ( !(jQuery.browser.msie && jQuery.browser.version < 7)) { // take away IE6
		var mTop = parseInt((TB_HEIGHT / 2),10) * -1;
		jQuery("#TB_window").css({marginTop: mTop  + 'px'});
		return mTop;
	} else {
		return 0;
	}
}
function tb_parseQuery ( query ) {
	var Params = {};
	if ( ! query ) {return Params;}// return empty object
	var Pairs = query.split(/[;&]/);
	for ( var i = 0; i < Pairs.length; i++ ) {
		var KeyVal = Pairs[i].split('=');
		if ( ! KeyVal || KeyVal.length != 2 ) {continue;}
		var key = unescape( KeyVal[0] );
		var val = unescape( KeyVal[1] );
		val = val.replace(/\+/g, ' ');
		Params[key] = val;
	}
	return Params;
}
function tb_getPageSize(){
	var de = document.documentElement;
	var w = window.innerWidth || self.innerWidth || (de&&de.clientWidth) || document.body.clientWidth;
	var h = window.innerHeight || self.innerHeight || (de&&de.clientHeight) || document.body.clientHeight;
	arrayPageSize = [w,h];
	return arrayPageSize;
}
function tb_detectMacXFF() {
	var userAgent = navigator.userAgent.toLowerCase();	
	if ( userAgent.indexOf('mac') != -1 && userAgent.indexOf('firefox') != -1 ) {
		return true;
	}
}

//---------------------------------------------------------------------
//added by hamid
/*
this is added by hamid, the callbacks are used to easily add functions
to different events the thickbox is handling....

Rob S: Extended callback functionality to include Namespaced events.  
	   This is to prevent overwriting existing events.
*/
var tb_callbacks = new Object();

/*
reigster a function with thickbox based on events
...currently supports:
-onload
-onremove
-onbeforeremove
*/

//public:
function tb_register_callback(callback_type, func){
	var ns = callback_type.split('.');
	if (ns.length < 2) { ns.push('tb_default_event_ns'); }
	if (typeof tb_callbacks[ ns[0] ] !== 'object') {
		tb_callbacks[ ns[0] ] = new Object();
	}
	tb_callbacks[ ns[0] ][ ns[1] ] = func;
}

// public:
function tb_unregister_callback(callback_type){
	var ns = callback_type.split('.');
	if (ns.length < 2) { ns.push('tb_default_event_ns'); }
	tb_callbacks[ ns[0] ][ ns[1] ] = null;
}

// private:
function tb_exec_callback(callback_type, unreg_event) {
	if (typeof unreg_event === 'undefined') { unreg_event = false; }
	if (tb_callbacks[ callback_type ]){
		for (var ns in tb_callbacks[ callback_type ]) {
			if (tb_callbacks[ callback_type ].hasOwnProperty(ns) && tb_callbacks[ callback_type ][ ns ] != null) {
				eval(tb_callbacks[ callback_type ][ ns ] + '();');
			}
		}
		if (unreg_event) {
			tb_unregister_callback(callback_type);
		}
	}
}
//END: added by hamid
