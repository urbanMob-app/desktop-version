//var test_version = false;
//var url = "http://www.smtt.890m.com"+(test_version == true ? "/teste":"");
//var url = "https://www.m1desenvolvimento.com.br"+(test_version == true ? "/teste":"/urbanmob");
const url = "https://www.m1desenvolvimento.com.br/urbanmob";
const msgPostToIframe = "Não foi possível identificar o seu dispositivo. Tente limpar o cache do app.";
const msgEnviarDadosEquipamentoForm = "Falha ao recuperar dados do usuário. Tente logar novamente!";
const msgSemInternet = "Não logou, sem internet. Verifique sua conexão!";
var mensagem = ""; // início de variável para local notification

(function( $ ){
    $.fn.alertaTela = function(msg) {
        this.delay(50).fadeIn().delay(3000).fadeOut();
        $("#alertTelaTd").text(msg);
    };
})( jQuery );

var app = {
    initialize: function() {
        this.bindEvents();
    },

    bindEvents: function(){
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },

    onDeviceReady: function() {
        document.addEventListener("pause", onPause, false);
        document.addEventListener("resume", onResume, false);
        document.addEventListener("menubutton", onMenuKeyDown, false);
        document.addEventListener("backbutton", onBackKeyDown, false);
        document.addEventListener("online", onOnline, false);
        document.addEventListener("offline", onOffline, false);

        cordova.plugins.notification.badge.set(0);
        cordova.plugins.notification.badge.configure({ autoClear: true });
        cordova.plugins.notification.badge.requestPermission(function (granted) {console.log('Badge granted: ' + granted);});
        cordova.plugins.notification.badge.configure({ indicator: 'circular' });
        window.localStorage.setItem("versaoApp",navigator.appInfo.version);
        window.plugins.sim.getSimInfo(successCallbackPluginSim, errorCallbackPluginSim);

        if(window.MobileAccessibility){
            window.MobileAccessibility.usePreferredTextZoom(false);
            function setTextZoomCallback(textZoom) {
                console.log('WebView text should be scaled ' + textZoom + '%');
            }        
            MobileAccessibility.setTextZoom(80, setTextZoomCallback);
        }


        if(FCM.hasPermission()){
            FCM.requestPushPermission({
                ios9Support: {
                  timeout: 10,
                  interval: 0.3
                }
              });
        }
        FCM.subscribeToTopic('mensagensGerais').then(topic => {
            console.log('Subscribe topic mensagensGerais: ' + topic);
        });
        FCM.onTokenRefresh((fcmToken) => {console.log('FCM token: ' + fcmToken);});        
        FCM.getToken().then(fcmToken => {window.localStorage.setItem("tokenId", fcmToken);});

        StatusBar.backgroundColorByName("black");

        var varIdEquip = device.uuid;
        var varModEquip = device.model;
        var varPlatEquip = device.platform;
        window.localStorage.setItem("idEquip", varIdEquip);
        window.localStorage.setItem("modEquip", varModEquip);
        window.localStorage.setItem("platEquip", varPlatEquip);
        
        function successCallbackPluginSim(result) {
            var deviceArray = {
                uuid: varIdEquip,
                model: varModEquip,
                platform: varPlatEquip,
                version: device.version,
                manufacturer: device.manufacturer,
                serial: device.serial,
                pluginSim: result
            }
            window.localStorage.setItem("deviceData",JSON.stringify(deviceArray));
        }
        
        function errorCallbackPluginSim(error) {
            console.log(error);
        }

        var networkState = navigator.connection.type;
        var login = window.localStorage.getItem("login");
        if (networkState !== Connection.NONE) {
            if(login == true) {
                var uri = url+"/validarDispositivoAppi";
                var teste = enviarDadosEquipamentoForm(uri,login);                
            }
            else {
                var uri = "telaLogin.html";
                var teste = enviarDadosEquipamentoForm(uri,login);
            }
            
            document.getElementById("pausaDeTelaDivIndex").style.display = "block";

            if(teste == true){
                document.getElementById("pausaDeTelaDivIndex").style.display = "none";
            }
            else{
                document.getElementById("iframeApp").src = "telaLogin.html";
                document.getElementById("pausaDeTelaDivIndex").style.display = "none";
                $.alert(msgEnviarDadosEquipamentoForm);
            }
        }
    },
};

app.initialize();

function requestReadPermission(){
    // permissão para o plugin sim card
    window.plugins.sim.requestReadPermission(successCallback, errorCallback);
    function successCallback(){
        $.alert({
            closeIcon: true,
            boxWidth: '70%',
            useBootstrap: false,
            title: 'OK',
            content: "Pronto, agora reinicie o aplicativo.",
        });
    }

    function errorCallback(){
        $.alert({
            closeIcon: true,
            boxWidth: '70%',
            useBootstrap: false,
            title: 'Falhou',
            content: "Não foi possível habilitar as permissões de telefone. Tente fazê-lo manualmente nas configurações do seu aparelho na guia Aplicativos.",
        });
    }
}

function onOnline() {
    // dispara quando o dispositivo estiver CONECTADO à rede
    var networkState = navigator.connection.type;
    if (networkState !== Connection.NONE) {
    }
}

function onOffline() {
    // dispara quando o dispositivo estiver desconectado da rede
}

function onPause() {
        StatusBar.backgroundColorByName("black");
}

function onResume() {
        var networkState = navigator.connection.type;
        if (networkState !== Connection.NONE) {
            cordova.plugins.notification.badge.clear();

            FCM.onTokenRefresh((fcmToken) => {
                window.localStorage.setItem("tokenId", fcmToken);
                console.log('FCM result: ' + fcmToken);
            });

            var iframe = document.getElementById("iframeApp");
            console.log(typeof iframe.contentWindow.coordenadorDoDia(0));
        }
}

function onMenuKeyDown() {
    // Handle the menubutton event
}

function onBackKeyDown() {
    // funcionando: deixa o app em background ao pressionar a tecla back
    navigator.Backbutton.goHome(function() {
        console.log('success');
      }, function() {
        console.log('fail');
      });
}

// envia dados ao equipamento
function enviarDadosEquipamentoForm(uri,login){
    function postToIframe(dados,uri){
        var postReturn = $.post(uri,dados,
            function(retorno){
                window.localStorage.setItem("login", retorno["login"]);
                var login = retorno["login"];
                if(login == true){
                    FCM.subscribeToTopic(dados["matricula"].toString()).then(topic => {
                        console.log('Subscribe topic matricula: ' + topic);
                    });
                    window.localStorage.setItem("retorno", JSON.stringify(retorno));
                    window.localStorage.setItem("dispositivos", JSON.stringify(retorno["dispositivos"]));
                    window.localStorage.setItem("login", retorno["login"]);
                    window.localStorage.setItem("hash", retorno["hash"]);
                    document.getElementById("iframeApp").src = "telaPosLogin.html";
                    document.getElementById("pausaDeTelaDivIndex").style.display = "none";
                    return true;
                }
                else{
                    FCM.unsubscribeFromTopic(dados["matricula"].toString()).then(topic => {
                        console.log('Unsubscribe topic matricula: ' + topic);
                    });
                    $('#alertTelaDiv').alertaTela(retorno["mensagemErro"]);
                    return false;
                }
            },
        "json")
        .fail(
            function(){
                $('#alertTelaDiv').alertaTela(msgPostToIframe);
                return false;
            }
        );
        return postReturn;
    }

    if(login == true){
        var varHash = window.localStorage.getItem("hash");
        var varSenha = window.localStorage.getItem("senha");
        var varMatricula = window.localStorage.getItem("matricula");
        var varTokenId = window.localStorage.getItem("tokenId");
        var varIdEquip = device.uuid;
        var varModEquip = device.model;
        var varPlatEquip = device.platform;
        var dados={
            tokenId: varTokenId,
            idEquip: varIdEquip,
            modEquip: varModEquip,
            platEquip: varPlatEquip,
            mobile: true,
            hash: varHash,
            matricula: varMatricula,
            senha: varSenha
        };
        if(teste = postToIframe(dados,uri)){
            return true;
        }
        else{
            return false;
        }
    }
    else{
        document.getElementById("iframeApp").src = uri;
        return true;
    }
}
// fim de envia dados ao equipamento

// pegar arquivo do album
function openFilePicker(setor,serverURI,params) {
    navigator.camera.getPicture(onSuccess, onFail, {
       quality: 40,
       destinationType: Camera.DestinationType.FILE_URI,
       sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
       saveToPhotoAlbum: false,
       encodingType: Camera.EncodingType.JPEG,
       mediaType: Camera.MediaType.PICTURE,
       allowEdit: true,
       correctOrientation: true
    });
    
    function onSuccess(imageData) {
       var imageUri = imageData;
       window.localStorage.setItem("imageUri", imageUri);
       enviarArquivo(setor,serverURI,params);
       return true;
    }
    
    function onFail(message) { 
        $('#alertTelaDiv').alertaTela(message);
        window.localStorage.setItem("imageUri", "img/semFoto.jpg");
        return false;
    }
 }

// camera
function cameraTakePicture() {
    navigator.camera.getPicture(onSuccess, onFail, {
       quality: 20,
       destinationType: Camera.DestinationType.FILE_URI,
       saveToPhotoAlbum: false,
       encodingType: Camera.EncodingType.JPEG,
       mediaType: Camera.MediaType.PICTURE,
       allowEdit: true,
       correctOrientation: true       
    });
    
    function onSuccess(imageData) {
       var imageUri = imageData;
       var iframe = document.getElementById("iframeApp");
       var elmnt = iframe.contentWindow.document.getElementById("imgDivAppDenuncias");
       elmnt.innerHTML = "<img src="+imageUri+" id='imgImgAppDenuncias'>";
       window.localStorage.setItem("imageUri", imageUri);
    }
    
    function onFail(message) { 
        $('#alertTelaDiv').alertaTela(message);
        window.localStorage.setItem("imageUri", "img/semFoto.jpg");
    } 
 }

// fim de camera

function scannerQrCode(op,msg){
    cordova.plugins.barcodeScanner.scan(
        function (result) {
            result.op = op;
            var iframe = document.getElementById("iframeApp");
            iframe.contentWindow.retornoQrCode(result);
        },
        function (error) {
            $.alert({
                closeIcon: true,
                boxWidth: '70%',
                useBootstrap: false,
                title: 'ERRO',
                content: 'Falha ao realizar leitura do QR Code. Tente novamente. ('+error+')',
            });
            var iframe = document.getElementById("iframeApp");
            iframe.contentWindow.retornoQrCode(false);
        },
        {
            preferFrontCamera : false, // iOS and Android
            showFlipCameraButton : true, // iOS and Android
            showTorchButton : true, // iOS and Android
            torchOn: false, // Android, launch with the torch switched on (if available)
            saveHistory: true, // Android, save scan history (default false)
            prompt : msg, // Android
            resultDisplayDuration: 0, // Android, display scanned text for X ms. 0 suppresses it entirely, default 1500
            formats : "QR_CODE,PDF_417", // default: all but PDF_417 and RSS_EXPANDED
            orientation : "portrait", // Android only (portrait|landscape), default unset so it rotates with the device
            disableAnimations : true, // iOS
            disableSuccessBeep: false // iOS and Android
        }
     );
}

function downloadFile(arquivo,url,estorage,id){
    downloader.init({folder: estorage, noMedia: false});
    downloader.get(url+arquivo);


    document.addEventListener("DOWNLOADER_initialized", function(){
        var msg = 'Baixando para a pasta Downloads... ';
        cordova.plugins.notification.local.schedule({
            id: id,
            title: arquivo,
            icon: 'res://drawable-ldpi/ic_notification_local',
            smallIcon: 'res://drawable-ldpi/ic_notification_local',
            sound: false,
            vibrate: false,
            text: msg+'0%',
            progressBar: {
                value: 0
            }
        });
    });

    document.addEventListener("DOWNLOADER_downloadSuccess", function(){
        cordova.plugins.notification.local.update({
            id: id,
            text: 'Download concluído. 100%',
            sound: false,
            vibrate: false,
            progressBar: {
                value: 100
            }
        });
        downloader.abort();
        cordova.InAppBrowser.open(url+arquivo, '_system', 'location=no');
    });

    cordova.plugins.notification.local.on("click", function(notification) {
        cordova.InAppBrowser.open(url+arquivo, '_system', 'location=no');
    });
}

function politicaDePrivacidade(urlPrivacy){
    cordova.InAppBrowser.open(urlPrivacy, '_system', 'location=no');
}