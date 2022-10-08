
let cliente = {
    mesa:"",
    hora:"",
    pedido: []
}; // primero almacenamos la info con dos string vacios y un array para guardar ahi la info


const categorias = { //definimos este objeto luego de agregar categorias a html
    1: "Comida",
    2: "Bebidas",
    3: "Postres"
}


const btnGuardarCliente = document.querySelector("#guardar-cliente");
btnGuardarCliente.addEventListener("click",guardarCliente); // seleccionamos al boton del modal y le damos un evento y que dispare una funcion

function guardarCliente() {
    const mesa = document.querySelector("#mesa").value; //seleccionamos inputs y leemos valores
    const hora = document.querySelector("#hora").value;

    //revisamos si hay vampos vacios
    const camposVacios = [mesa,hora].some(campo => campo === ""); //colcamos dentro de array validacion  y usamos un some para validar si almenos 1  cumple con la condicion de un string vacio

    if(camposVacios) { //si hay un campo vacio almenos...

        const existeAlerta = document.querySelector(".invalid-feedback"); //seleccionamos clase de ivalido para validar que no exista y asi leugo agregar info

        if(!existeAlerta) {
            const alerta = document.createElement("div")
            alerta.classList.add("invalid-feedback","d-block","text-center")
            alerta.textContent = "Todos los campos son obligatorios";
            document.querySelector(".modal-body form").appendChild(alerta);  
            
            setTimeout(() => { //elimina alerta
                alerta.remove();
            }, 3000);
        }
    
        return;

    } 

    // asignamos datos del form al objeto...

    cliente = {...cliente,mesa,hora}

    // Ocultamos modal una vez pasada la valid
    const modalForm = document.querySelector("#formulario")
    const modalBootstrap = bootstrap.Modal.getInstance(modalForm) //obtenemos formulario y leugo se lo pasamos para que obtenga la instancia del mismo
    modalBootstrap.hide();

    mostrarSecciones(); //llamamos funcion que saca las clases de oculto

    obtenerPlatos(); //Llamamos funcion que obtiene los platos
}

function mostrarSecciones() { //sacamos clases ocultas iterando sobre cada una
    const seccionesOcultas = document.querySelectorAll(".d-none");
    seccionesOcultas.forEach(secciones => secciones.classList.remove("d-none"))
}

function obtenerPlatos() {
    const url = "http://localhost:3000/platillos"

    fetch(url)
        .then( respuesta => respuesta.json()) //leemos el contenido en json regresandolo en objetos de JS
        .then( resultado => mostrarPlatos(resultado)) //notar que creamos una funcion y le pasamos todo el resultado
        .catch(error => console.log(error))
}
    
function mostrarPlatos(platos) {
    const contenido = document.querySelector("#platillos .contenido"); //seleccionamos el div de contenido vacio donde colocaremos contenido con scripting

    platos.forEach(platos => {  //usamos llaves x muchas lineas, iteramos sobre cada resultado del array json
        const row = document.createElement("div");
        row.classList.add("row", "py-3", "border-top"); //row que nos da acceso a grid

        const nombre = document.createElement("div")
        nombre.classList.add("col-md-4");
        nombre.textContent = platos.nombre

        const precio = document.createElement("div") // tambien extraemos el precio con template string para poder poner el $
        precio.classList.add("col-md-3","fw-bold");
        precio.textContent = `$${platos.precio}`

        const categoria = document.createElement("div")
        categoria.classList.add("col-md-3");
        categoria.textContent = categorias [platos.categoria]; // agregamos la categoria y ahora creamos un objeto definiendo a que pertenece cada categoria mas arriba
        // recordar el objeto por arriba con el numero y el nombre de la misma, aqui filtra dentro del objeto categorias y dice, si la categoria es 2 es bebidas o 1 es comidas.

        const inputCantidad = document.createElement("input");
        inputCantidad.type = "number";
        inputCantidad.min=0;
        inputCantidad.value=0;
        inputCantidad.id=`producto-${platos.id}`;
        inputCantidad.classList.add("form-control")

        inputCantidad.onchange = function() {
            const cantidad = parseInt(inputCantidad.value)
            agregarPlatos({...platos,cantidad}) //notar que lo igualamos a una funcion y llamamos una funcion con aprametros dentro, esto hace que recien cuando cambiemos un input nos traiga ese input, sino nos traeria todos
        } // usamos spread operator para que cree un objeto y la cantidad la coloque dentro del mismo

        const agregar = document.createElement("div");
        agregar.classList.add("col-md-2");
        agregar.appendChild(inputCantidad)

        row.appendChild(nombre);
        row.appendChild(precio);
        row.appendChild(categoria);
        row.appendChild(agregar);
        contenido.appendChild(row)
    })
}


function agregarPlatos(producto) { //agarra la info del producto cambiado. esto es por el id de cada input relacionada al producto
    
    let {pedido} = cliente; //sacamos el array de l variable de cliente
    
    if(producto.cantidad > 0) {
        
        if(pedido.some(articulo => articulo.id === producto.id)) { // con este some validamos si existe el producto
            // el articulo ya existe, debemos actualziar
            const pedidoActualziado = pedido.map(articulo => { //ya sabemos que existe uno pero debemos identificar cual es para cambiar la cantidad (retorna arreglo nuevo)
                if( articulo.id === producto.id ) { // identificamos el elemento  que hay que actualziar
                    articulo.cantidad = producto.cantidad 
                }
                return articulo;
            })
            //se asigna el nuevo array a cliente.pedido
            cliente.pedido = [...pedidoActualziado];
        } else {
            cliente.pedido = [...pedido,producto] //agregamos copia del array y le agregamos el producto
        }
        
    } else {
        // Eliminar elementos cuando la cantidad es 0
        const resultado = pedido.filter(articulo => articulo.id != producto.id) //queremos los objetos distintos al articulo que tenga el mismo id... eliminamos los otros
        cliente.pedido = [...resultado]
    }

    //limpiar HTML
    limpiarHTML();

    if (cliente.pedido.length) {
        //Mostrar el resumen
        actualizarResumen();
    } else {
        mensajePedidoVacio();
    }

}

function actualizarResumen () {
    const contenido = document.querySelector("#resumen .contenido");

    const resumen = document.createElement("div");
    resumen.classList.add("col-md-6", "card", "py-5", "px-3","shadow");

    // info mesa
    const mesa = document.createElement("p");
    mesa.textContent = "mesa: ";
    mesa.classList.add("fw-bold");

    const mesaSpan = document.createElement("span")
    mesaSpan.textContent = cliente.mesa;
    mesaSpan.classList.add("fw-normal");

    //info hora 
    const hora = document.createElement("p");
    hora.textContent = "hora: ";
    hora.classList.add("fw-bold");

    const horaSpan = document.createElement("span")
    horaSpan.textContent = cliente.hora;
    horaSpan.classList.add("fw-normal");

    // titulo de la seccion
    const heading = document.createElement("H3")
    heading.textContent = "Platos Consumidos";
    heading.classList.add("my-4", "text-center");

    // agregar contenido 
    mesa.appendChild(mesaSpan)
    hora.appendChild(horaSpan)

    
    // iteracion de array.
    const grupo = document.createElement("UL")
    grupo.classList.add("list-group")
    
    const {pedido} = cliente
    pedido.forEach(elemenento => {
        const {nombre,cantidad,precio,id} = elemenento
        
        const lista = document.createElement("li");
        lista.classList.add("list-group-item")
        
        //nombre articulo

        const nombreEl = document.createElement("h4")
        nombreEl.classList.add("my-4")
        nombreEl.textContent= nombre 

        //cantidad artiuclo

        const cantidadEl = document.createElement("p")
        cantidadEl.classList.add("my-4")
        cantidadEl.textContent= "Cantidad: " 

        const cantidadValor = document.createElement("span");
        cantidadValor.classList.add("fw-normal")
        cantidadValor.textContent = cantidad

        //precio articulo

        const precioEl = document.createElement("p")
        precioEl.classList.add("my-4")
        precioEl.textContent= "Precio: " 

        const precioValor = document.createElement("span");
        precioValor.classList.add("fw-normal");
        precioValor.textContent = `$${precio}`;

        
        //subtotal articulo
        
        const subtotalEl = document.createElement("p")
        subtotalEl.classList.add("my-4")
        subtotalEl.textContent= "Subtotal: " 

        const subtotalValor = document.createElement("span");
        subtotalValor.classList.add("fw-normal");
        subtotalValor.textContent = precio * cantidad;
        
        
        // Boton para eliminar

        const btnEliminar = document.createElement("button");
        btnEliminar.classList.add("btn", "btn-danger");
        btnEliminar.textContent = "Eliminar del Pedido";

        // funcion para eliminar del pedido
        btnEliminar.onclick = function () {
            eliminarProducto(id)
        }

        //agregando a contenedor
        cantidadEl.appendChild(cantidadValor)
        precioEl.appendChild(precioValor)
        subtotalEl.appendChild(subtotalValor)
        
        //Agregando a lista 
        lista.appendChild(nombreEl)
        lista.appendChild(cantidadEl)
        lista.appendChild(precioEl)
        lista.appendChild(subtotalEl)
        lista.appendChild(btnEliminar)

        //Agregando a UL
        grupo.appendChild(lista)
    })
    resumen.appendChild(heading)
    resumen.appendChild(mesa)
    resumen.appendChild(hora)
    resumen.appendChild(grupo)
    
    contenido.appendChild(resumen)

    formularioPropinas(); // disparamos funciones que crea otra columna que calcula propinas
}



function limpiarHTML() {
    const contenido = document.querySelector("#resumen .contenido")

    while(contenido.firstChild) {
        contenido.removeChild(contenido.firstChild)
    }
}

function eliminarProducto(id) {
    const {pedido} = cliente
    const resultado = pedido.filter(articulo => articulo.id != id) //queremos los objetos distintos al articulo que tenga el mismo id... eliminamos los otros
    cliente.pedido = [...resultado]
    //limpiar HTML
    limpiarHTML();
    if (cliente.pedido.length) {
        //Mostrar el resumen
        actualizarResumen();
    } else {
        mensajePedidoVacio();
    }

    //el producto se elimino por ende el form vuevle a 0
    const productoEliminado = `#producto-${id}`;
    const inputEliminado = document.querySelector(productoEliminado)
    inputEliminado.value = 0
}

function mensajePedidoVacio() {
    const contenido = document.querySelector("#resumen .contenido")

    const texto = document.createElement("p")
    texto.classList.add("text-center")
    texto.textContent = "Añade los elementos del pedido";

    contenido.appendChild(texto)

}

function formularioPropinas() {
    const contenido = document.querySelector("#resumen .contenido")

    const formulario = document.createElement("div")
    formulario.classList.add("col-md-6","formulario")

    const divFormulario = document.createElement('div');
    divFormulario.classList.add("card", "py-5", "px-3","shadow","text-center")

    const heading = document.createElement("h3")
    heading.classList.add("my-4")
    heading.textContent = "Propina";

    // Radio Button 10%
    const radio10 = document.createElement("input")
    radio10.type = "radio";
    radio10.name = "propina";
    radio10.value = 10;
    radio10.classList.add = ("form-check.input")
    radio10.onclick = calcularPropina;

    const radio10Label = document.createElement("label")
    radio10Label.textContent = "10%";
    radio10Label.classList.add("form-chech-label");

    const radio10Div = document.createElement("div")
    radio10Div.classList.add("form-check")

    radio10Div.appendChild(radio10)
    radio10Div.appendChild(radio10Label)

    // Radio Button 25%
    const radio25 = document.createElement("input")
    radio25.type = "radio";
    radio25.name = "propina";
    radio25.value = 25;
    radio25.classList.add = ("form-check.input")
    radio25.onclick = calcularPropina;

    const radio25Label = document.createElement("label")
    radio25Label.textContent = "25%";
    radio25Label.classList.add("form-chech-label");

    const radio25Div = document.createElement("div")
    radio25Div.classList.add("form-check")

    radio25Div.appendChild(radio25)
    radio25Div.appendChild(radio25Label)

    // Radio Button 50%
    const radio50 = document.createElement("input")
    radio50.type = "radio";
    radio50.name = "propina";
    radio50.value = 50;
    radio50.classList.add("form-check.input")
    radio50.onclick = calcularPropina;

    const radio50Label = document.createElement("label")
    radio50Label.textContent = "50%";
    radio50Label.classList.add("form-chech-label");

    const radio50Div = document.createElement("div")
    radio50Div.classList.add("form-check")

    radio50Div.appendChild(radio50)
    radio50Div.appendChild(radio50Label)

    // agregando div principal
    divFormulario.appendChild(heading)
    divFormulario.appendChild(radio10Div)
    divFormulario.appendChild(radio25Div)
    divFormulario.appendChild(radio50Div)

    // agregando div al form
    formulario.appendChild(divFormulario)

    contenido.appendChild(formulario)
}

function calcularPropina() {
    const {pedido} = cliente
    let subtotal = 0

    // calcular el subtotal a pagar
    pedido.forEach(articulo => {
        const {cantidad,precio} = articulo
        subtotal += cantidad * precio;
    });

    // seleccionar el radio button con la propina del cliente
    const propinaSeleccionada = document.querySelector('[name="propina"]:checked').value;

    // Calcular propina
    const propina = ((subtotal * propinaSeleccionada) / 100);

    //total a pagar
    const total = propina + subtotal;
    console.log(total)

    mostrarHtmlPropina(total,subtotal,propina)
}


function mostrarHtmlPropina(total,subtotal,propina) {
    
    //subtotal en texto

    const divTotales = document.createElement("div");
    divTotales.classList.add("total-pagar");

    const subtotalParrafo = document.createElement("p")
    subtotalParrafo.classList.add("fs-3","fw-bold","mt-2")
    subtotalParrafo.textContent = "Subtotal de consumo"

    const spanParrafo = document.createElement("span")
    spanParrafo.classList.add("fw-normal")
    spanParrafo.textContent = `$${subtotal}`

    subtotalParrafo.appendChild(spanParrafo)
    
    //propina
    
    const propinaParrafo = document.createElement("p")
    propinaParrafo.classList.add("fs-3","fw-bold","mt-2")
    propinaParrafo.textContent = "Propina:"

    const spanPropina = document.createElement("span")
    spanPropina.classList.add("fw-normal")
    spanPropina.textContent = `$${propina}`

    propinaParrafo.appendChild(spanPropina)
    
    //total
    
    const totalParrafo = document.createElement("p")
    totalParrafo.classList.add("fs-3","fw-bold","mt-2")
    totalParrafo.textContent = "Total:"
    
    const spanTotal = document.createElement("span")
    spanTotal.classList.add("fw-normal")
    spanTotal.textContent = `$${total}`
    
    totalParrafo.appendChild(spanTotal)
    
    // elimino el div
    const totalPagoDiv = document.querySelector(".total-pagar")
    if (totalPagoDiv) {
        totalPagoDiv.remove();
    }
    
    //agrego al div
    divTotales.appendChild(subtotalParrafo)
    divTotales.appendChild(propinaParrafo)
    divTotales.appendChild(totalParrafo)
    
    //elijo el primer div para meter el contenido
    const form = document.querySelector(".formulario > div")
    form.appendChild(divTotales)
}