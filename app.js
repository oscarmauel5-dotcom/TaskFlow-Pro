'use strict';
class Tarea {
 constructor(id,nombre,prioridad='Normal',completada=false){Object.assign(this,{id,nombre,prioridad,completada});}
 editar(nombre,prioridad){this.nombre=nombre;this.prioridad=prioridad;}
 cambiarEstado(){this.completada=!this.completada;}
 eliminar(){return this.id;}
}
class GestorDeTareas {
 constructor(){this.tareas=[];this.clave='taskflow-pro-v1';}
 cargar(){return Promise.resolve().then(()=>{const datos=JSON.parse(localStorage.getItem(this.clave)||'[]');this.tareas=datos.map(t=>new Tarea(t.id,t.nombre,t.prioridad,t.completada));});}
 guardar(){return Promise.resolve().then(()=>localStorage.setItem(this.clave,JSON.stringify(this.tareas)));}
 crear(nombre,prioridad){this.tareas.push(new Tarea(`${Date.now()}-${Math.random().toString(36).slice(2)}`,nombre,prioridad));}
 editar(id,nombre,prioridad){this.tareas.find(t=>t.id===id)?.editar(nombre,prioridad);}
 cambiarEstado(id){this.tareas.find(t=>t.id===id)?.cambiarEstado();}
 eliminar(id){const tarea=this.tareas.find(t=>t.id===id);if(tarea)this.tareas=this.tareas.filter(t=>t.id!==tarea.eliminar());}
}
const $=id=>document.getElementById(id), gestor=new GestorDeTareas();let editando=null;
const guardar=()=>gestor.guardar().then(()=>{$('storage').textContent='✓ Cambios guardados en este navegador.';}).catch(()=>{$('storage').textContent='No se pudo guardar: el navegador restringe LocalStorage.';});
const reset=()=>{editando=null;$('form').reset();$('submit').textContent='＋ Agregar';$('formtitle').textContent='Nueva tarea';$('cancel').hidden=true;};
const render=()=>{const total=gestor.tareas.length,done=gestor.tareas.filter(t=>t.completada).length,p=total?Math.round(done/total*100):0;$('total').textContent=total;$('pending').textContent=total-done;$('completed').textContent=done;$('percent').textContent=`${p}%`;$('progress').value=p;$('tasks').replaceChildren();const filtro=$('filter').value;const visibles=gestor.tareas.filter(t=>filtro==='all'||(filtro==='done'?t.completada:!t.completada));visibles.forEach(t=>{const li=document.createElement('li');li.className=t.completada?'done':'';const nombre=document.createElement('div');nombre.className='taskname';nombre.textContent=t.nombre;const prioridad=document.createElement('span');prioridad.className='priority';prioridad.textContent=`Prioridad: ${t.prioridad}`;nombre.append(prioridad);const acciones=document.createElement('div');acciones.className='actions';const boton=(texto,clase,fn)=>{const b=document.createElement('button');b.type='button';b.textContent=texto;b.className=clase;b.addEventListener('click',fn);return b;};acciones.append(boton(t.completada?'Reabrir':'Completar','toggle',()=>{gestor.cambiarEstado(t.id);render();guardar();}),boton('Editar','edit',()=>{editando=t.id;$('name').value=t.nombre;$('priority').value=t.prioridad;$('submit').textContent='Guardar cambios';$('formtitle').textContent='Editar tarea';$('cancel').hidden=false;$('name').focus();}),boton('Eliminar','delete',()=>{gestor.eliminar(t.id);if(editando===t.id)reset();render();guardar();}));li.append(nombre,acciones);$('tasks').append(li);});$('empty').hidden=visibles.length>0;};
$('form').addEventListener('submit',e=>{e.preventDefault();const nombre=$('name').value.trim();if(!nombre){$('message').textContent='Escribe una tarea antes de continuar.';return;}const prioridad=$('priority').value;if(editando===null)gestor.crear(nombre,prioridad);else gestor.editar(editando,nombre,prioridad);reset();$('message').textContent='';render();guardar();});$('cancel').addEventListener('click',()=>{reset();$('message').textContent='';});$('filter').addEventListener('change',render);$('submit').disabled=true;gestor.cargar().catch(()=>{$('storage').textContent='No se pudieron cargar las tareas guardadas.';}).finally(()=>{render();$('submit').disabled=false;});
