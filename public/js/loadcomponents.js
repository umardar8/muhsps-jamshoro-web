function loadcomponents(id, component){

    let myComponent = document.getElementById(id); 

    fetch(component)
        .then(response => response.text())
        .then(data => myComponent.innerHTML = data)
}

loadcomponents('header', '/components/header.html')
loadcomponents('footer', '/components/footer.html')