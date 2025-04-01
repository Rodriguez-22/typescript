"use strict";

// Definimos interfaces para las listas y los items
interface Item {
  id: number;
  descripcion: string;
}

interface Lista {
  id: number;
  nombre: string;
  items: Item[];
}

// Aseguramos que los elementos existen en el DOM
const listaElement = document.getElementById("lista") as HTMLUListElement;
const itemInput = document.getElementById("miInput") as HTMLInputElement;
const seleccionarLista = document.getElementById("seleccionarLista") as HTMLSelectElement;
const tituloLista = document.getElementById("tituloLista") as HTMLHeadingElement;
const eliminarListaBtn = document.getElementById("eliminarListaBtn") as HTMLButtonElement;
const crearListaBtn = document.getElementById("crearListaBtn") as HTMLButtonElement;

let listas: Lista[] = [];  // Lista de todas las listas
let listaActiva: Lista | null = null;  // La lista actualmente activa

document.addEventListener("DOMContentLoaded", () => {
  // Cargar listas desde el localStorage
  cargarListasDesdeLocalStorage();

  // Crear nueva lista
  crearListaBtn.addEventListener("click", crearNuevaLista);

  // Actualizar la vista cuando se cambia la lista activa
  seleccionarLista.addEventListener("change", cambiarListaActiva);

  // Eliminar lista
  eliminarListaBtn.addEventListener("click", eliminarLista);
});

function cargarListasDesdeLocalStorage(): void {
  // Recuperar las listas del localStorage
  const listasGuardadas = localStorage.getItem("listas");
  if (listasGuardadas) {
    listas = JSON.parse(listasGuardadas) as Lista[];
  }

  // Actualizar el selector con las listas guardadas
  actualizarListaSelector();

  // Si hay listas, seleccionar la primera
  if (listas.length > 0) {
    seleccionarLista.value = listas[0].id.toString();
    cambiarListaActiva();
  }
}

function actualizarListaSelector(): void {
  // Limpiar las opciones del selector
  seleccionarLista.innerHTML = "<option value=''>Seleccione una lista</option>";

  // Agregar las opciones de las listas
  listas.forEach(lista => {
    const option = document.createElement("option");
    option.value = lista.id.toString();
    option.textContent = lista.nombre;
    seleccionarLista.appendChild(option);
  });
}

function crearNuevaLista(): void {
  const nombreLista = prompt("Ingrese el nombre de la nueva lista:");
  if (nombreLista) {
    const nuevaLista: Lista = {
      id: listas.length + 1,  // Asignamos un ID único
      nombre: nombreLista,
      items: []  // Inicializamos la lista con un arreglo vacío
    };
    listas.push(nuevaLista);
    actualizarListaSelector();
    guardarListasEnLocalStorage();
  }
}

function cambiarListaActiva(): void {
  const listaId = parseInt(seleccionarLista.value);
  if (listaId) {
    listaActiva = listas.find(lista => lista.id === listaId) || null;
    tituloLista.textContent = listaActiva ? listaActiva.nombre : "";
    renderizarLista();
    
    // Habilitar el botón de eliminar lista
    eliminarListaBtn.disabled = false;
  } else {
    listaActiva = null;
    tituloLista.textContent = "Lista de la Compra";
    listaElement.innerHTML = "";
    
    // Deshabilitar el botón de eliminar lista si no hay lista seleccionada
    eliminarListaBtn.disabled = true;
  }
}

function renderizarLista(): void {
  if (!listaActiva) return;

  // Limpiar la lista
  listaElement.innerHTML = "";

  // Renderizar los elementos de la lista activa
  listaActiva.items.forEach(item => {
    const li = document.createElement("li");
    li.innerHTML = `
      <span>${item.descripcion}</span>
      <button class="danger" onclick="eliminarItem(${item.id}, this)">❌</button>
      <button class="edit" onclick="editarItem(${item.id}, this)">✏️</button>
    `;
    listaElement.appendChild(li);
  });
}

function agregarItem(): void {
  if (!listaActiva || !itemInput.value.trim()) return;

  const itemDescripcion = itemInput.value.trim();
  itemInput.value = "";

  const nuevoItem: Item = {
    id: listaActiva.items.length + 1,
    descripcion: itemDescripcion
  };

  listaActiva.items.push(nuevoItem);
  renderizarLista();
  guardarListasEnLocalStorage();
}

function eliminarItem(id: number, boton: HTMLElement): void {
  if (!listaActiva) return;

  // Filtrar el item con el ID proporcionado
  listaActiva.items = listaActiva.items.filter(item => item.id !== id);

  // Eliminar el elemento de la interfaz
  const li = boton.parentElement;
  if (li) {
    li.remove();
  }

  // Guardar el estado actualizado de las listas
  guardarListasEnLocalStorage();
}

function editarItem(id: number, boton: HTMLElement): void {
  if (!listaActiva) return;

  const nuevoTexto = prompt("Editar item:", boton.parentElement?.firstChild?.textContent?.trim());
  if (!nuevoTexto) return;

  // Buscar el item en la lista activa
  const item = listaActiva.items.find(item => item.id === id);
  if (item) {
    item.descripcion = nuevoTexto;

    // Verificar que el parentElement y el span existan antes de cambiar el texto
    const span = boton.parentElement?.querySelector("span");
    if (span) {
      span.textContent = nuevoTexto;
    }

    // Guardar el estado actualizado de las listas
    guardarListasEnLocalStorage();
  }
}

function eliminarLista(): void {
  if (!listaActiva) {
    console.error("No hay lista activa seleccionada.");
    return;  // Si no hay lista activa, salimos de la función
  }

  const confirmacion = confirm(`¿Estás seguro de que deseas eliminar la lista "${listaActiva.nombre}"?`);
  if (confirmacion) {
    // Eliminar la lista de la estructura de datos
    listas = listas.filter(lista => lista.id !== listaActiva!.id);

    // Limpiar el selector de listas
    actualizarListaSelector();

    // Resetear la lista activa
    listaActiva = null;
    seleccionarLista.value = "";
    tituloLista.textContent = "Lista de la Compra";
    listaElement.innerHTML = "";

    // Deshabilitar el botón de eliminar lista
    eliminarListaBtn.disabled = true;

    // Guardar el estado actualizado de las listas en localStorage
    guardarListasEnLocalStorage();
  }
}

function guardarListasEnLocalStorage(): void {
  // Guardamos las listas en el localStorage
  localStorage.setItem("listas", JSON.stringify(listas));
}
