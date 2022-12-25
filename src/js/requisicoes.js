var url = "http://localhost/";

function carregando(){
    $("#validando").html("Validando...");
}


function verificar(){
    if(form.valid()){
        cadastro();
        alert("FOI");
    }
    else{
        alert("NÃO FOI");
    }
}


function login(){
    //var uri = url + "servidor/validar.php";
    var uri = 'http://localhost:8080/v1/login'

    var usuario = new Object();
    usuario.cpf = document.getElementById("cpf").value;
    usuario.senha = document.getElementById("senha").value;

    var dados = {
        cpf: usuario.cpf,
        senha: usuario.senha    
    }

    //var dados = JSON.stringify(dados);

    try{
        $.ajax({
            type: "POST",
            assync: false,
            url: uri,
            data: dados,
            success: validado,
            dataType: "json",
            xhrFields: {
                withCredentials: true
             },
             crossDomain: true
        });
    }catch(erro){
        alert(erro);
    }

    function validado(retorno){

        //retorno = JSON.parse(retorno);

        if(retorno.status === "falha"){
            alert(retorno.mensagem);
        }else{
            window.location.href = "indices/pesquisar.php";
        }

    }

    window.localStorage.setItem("matricula", usuario.cpf);
    window.localStorage.setItem("senha", usuario.senha);
}

function auth(){

    var uri = 'http://localhost:8080/v1/auth'

    try{
        $.ajax({
            type: "GET",
            assync: false,
            url: uri,
            success: validado,
            dataType: "json",
            xhrFields: {
                withCredentials: true
             },
             crossDomain: true
        });
    }catch(erro){
        alert(erro);
    }

    function validado(retorno){
        alert(retorno);
    }

}



function cadastro(){

    var uri = url + "servidor/cadastrar.php"

    var usuario = new Object();
    usuario.cpf = document.getElementById("cpf").value;
    usuario.senha = document.getElementById("senha").value;
    usuario.email = document.getElementById("email").value;
    usuario.numero = document.getElementById("numero").value;

    var dados = {
        cpf: usuario.cpf,
        senha: usuario.senha,
        email: usuario.email,   
        numero: usuario.numero    
    }

    try{
        $.ajax({
            type: "POST",
            assync: false,
            url: uri,
            data: dados,
            success: validado,
            dataType: "json"
        });
    }catch(erro){
        alert(erro);
    }    

    function validado(retorno){
        alert(retorno);
    }

    window.localStorage.setItem("cpf", usuario.cpf);
    window.localStorage.setItem("senha", usuario.senha);
    window.localStorage.setItem("email", usuario.email);
    window.localStorage.setItem("numero", usuario.numero);
}