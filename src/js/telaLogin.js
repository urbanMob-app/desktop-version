//var test_version = true;
//var url = "http://www.smtt.890m.com"+(test_version == true ? "/teste":"");
// $.get("https://ipinfo.io", function(response){ip = response.ip;}, "json");
var url = "https://www.m1desenvolvimento.com.br/urbanmob";
var tamMinUsuario = 4;
var tamMaxUsuario = 4;
var msgErroUsuario = "ERRO: Digite sua matrícula corretamente!";
var msgErroSenha = "ERRO: Digite a senha corretamente!";
var msgRedefinirSenha = "SENHA: Esta rotina redefine sua senha de acesso. Deseja continuar?";
var ip =  "200.223.238.71";
var os = window.navigator.userAgent.toLowerCase();
var mobile = (os.search(/android/gi)>-1 ? true : false);

(function( $ ){
    $.fn.alertaTela = function(msg) {
        this.delay(50).fadeIn().delay(3000).fadeOut();
        $("#alertTelaTd").text(msg);
    };
})( jQuery );


$(document).ready(function(){
    var options =  {
        onComplete: function() {
            $("#senha").focus();
        }
    };
    $(".matricula").mask("9999", options);
});

function formLoginInit(focus){
    if(!mobile){
        idEquip = ip;
        modEquip = "desktop";
        platEquip = "desktop";
        window.localStorage.setItem("idEquip", ip);
        window.localStorage.setItem("modEquip", "desktop");
        window.localStorage.setItem("platEquip", "desktop");
    }
    document.getElementById("idEquip").value = window.localStorage.getItem("idEquip");
    document.getElementById("modEquip").value = window.localStorage.getItem("modEquip");
    document.getElementById("platEquip").value = window.localStorage.getItem("platEquip");
    document.getElementById(focus).focus();
}

// login no sistema (usado apenas quando telaLogin.html estiver on)
function validarLogin(){
    var uri = url+"/validarLoginAppi.php";
    var matricula = document.getElementById("matricula").value;
    var senha = document.getElementById("senha").value;
    var idEquip = document.getElementById("idEquip").value;
    var modEquip = document.getElementById("modEquip").value;
    var platEquip = document.getElementById("platEquip").value;
    var qrcodeLogin = document.getElementById("qrcodeLogin").value;
    if(matricula=="" || matricula.length < tamMinUsuario || matricula.length > tamMaxUsuario){
        $('#alertTelaDiv').alertaTela(msgErroUsuario);
        document.getElementById("matricula").focus();
        return false;
    }
    else if(senha==""){
        $('#alertTelaDiv').alertaTela(msgErroSenha);
        document.getElementById("senha").focus();        
        return false;
    }    
    else{
        window.localStorage.setItem("senha", senha);
        window.localStorage.setItem("matricula", matricula);
        document.getElementById("pausaDeTelaDiv").style.display = "block";
        var dados={
            mobile: true,
            idEquip: idEquip,
            modEquip: modEquip,
            platEquip: platEquip,
            matricula: matricula,
            senha: senha,
            qrcodeLogin: qrcodeLogin
        };

        // debug
        // alert(JSON.stringify(dados)+" - "+uri+" - "+mobile);


        $.post(uri,dados,
            function(retorno){
                success_login(retorno);
            },
        "json")
        .fail(
            function(err){
                document.getElementById("pausaDeTelaDiv").style.display = "none";
                $('#alertTelaDiv').alertaTela("ERRO: condição inesperada! "+JSON.stringify(err));
        });

        function success_login(retorno){
            var login = retorno["login"];
            document.getElementById("pausaDeTelaDiv").style.display = "none";
            if(login == true){
                    window.localStorage.setItem("retorno", JSON.stringify(retorno));
                    window.localStorage.setItem("dispositivos", JSON.stringify(retorno["dispositivos"]));
                    window.localStorage.setItem("login", retorno["login"]);
                    window.localStorage.setItem("hash", retorno["hash"]);
                    // montar a tela e apresentar neste local
                    document.getElementById("pausaDeTelaDiv").style.display = "none";
                    ( !mobile ? window.open("telaPosLogin.html","_self") : parent.document.getElementById("iframeApp").src = "telaPosLogin.html");
                    //parent.document.getElementById("iframeApp").src = "telaPosLogin.html";
                }
            else{
                $('#alertTelaDiv').alertaTela(retorno["mensagemErro"]);
                document.getElementById("pausaDeTelaDiv").style.display = "none";
                document.getElementById("matricula").focus();
            }
        }
    }
}

function redefinirSenha(){
    var uri = url+"/redefinirSenhaAppi.php";
    var idEquip = document.getElementById("idEquip").value;
    var modEquip = document.getElementById("modEquip").value;
    var platEquip = document.getElementById("platEquip").value;
    if(confirm(msgRedefinirSenha)){
        // testa inputs
        var matricula = document.getElementById("matricula").value;
        if(matricula=="" || matricula.length < tamMinUsuario || matricula.length > tamMaxUsuario){
            $('#alertTelaDiv').alertaTela(msgErroUsuario);
            document.getElementById("matricula").focus();
            return false;
        }
        else{
            // pegar dados do dispositivo e enviar para o form
            document.getElementById("pausaDeTelaDiv").style.display = "block";
            var dados={
                mobile: true,
                matricula: matricula,
                idEquip: idEquip,
                modEquip: modEquip,
                platEquip: platEquip
            };
            
            // debug
            //alert(JSON.stringify(dados)+" - "+uri+" - "+mobile);

            $.post(uri,dados,
                function(retorno){
                    document.getElementById("pausaDeTelaDiv").style.display = "none";
                    var op = retorno["op"];
                    if(op == true){
                        success_pass(retorno);
                        return true;
                    }
                    else{
                        $('#alertTelaDiv').alertaTela(retorno["mensagemErro"]);
                        document.getElementById("matricula").focus();
                        return false;
                    }
            },
            "json")
            .fail(
                function(err){
                    document.getElementById("pausaDeTelaDiv").style.display = "none";
                    $('#alertTelaDiv').alertaTela("ERRO: Não foi possível estabelecer a conexão. Tente mais tarde!");
            });

            function success_pass(retorno){
                $('#alertTelaDiv').alertaTela(retorno["mensagemErro"]);
                document.getElementById("matricula").focus();
            }
        }
    }
    else{
        return false;
    }
}

function exibirOcultarSenha(idName,idImg,className){
    var tipo = document.getElementById(idName).type;
    if(tipo == "password"){
        if(className.length > 1){
            var x = document.getElementsByClassName(className);
            var i;
            for (i = 0; i < x.length; i++) {
                x[i].type = "text";
            }
        }
        else{
            document.getElementById(idName).type = "text";
        }
        document.getElementById(idImg).src = "img/resource_link_images/ocultarSenha.png";
    }
    else{
        if(className.length > 1){
            var x = document.getElementsByClassName(className);
            var i;
            for (i = 0; i < x.length; i++) {
                x[i].type = "password";
            }            
        }
        else{
            document.getElementById(idName).type = "password";
        }
        document.getElementById(idImg).src = "img/resource_link_images/exibirSenha.png";
    }
}

function retornoQrCode(result){
    if(result.cancelled !== true){
        var str = result.text;
        var tam = str.length;
        var qr = str.substr(4, tam);
        var retorno = atob(qr).split("-");
        document.getElementById("matricula").value = retorno[0];
        document.getElementById("senha").value = retorno[1];
        document.getElementById("qrcodeLogin").value = 1;
        if(result.op === 1){
            validarLogin();
        }
    }
    else{
        $('#alertTelaDiv').alertaTela("Leitura de QRCode cancelada!");
    }
}
