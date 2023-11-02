<script setup>

  import {ref, computed}  from "vue";
  // Import Bootstrap and BootstrapVue CSS files (order is important)
  import 'bootstrap/dist/css/bootstrap.css'
  import 'bootstrap-vue/dist/bootstrap-vue.css'
  import countries from "../src/components/json/paises.json";
  import rangosSalariales from "../src/components/rangosSalariales.js";
  import {destinosInternacionales, getColumna, getDestino} from "./components/destinosInternacionales.js"

 
 const salarioMinimo= parseInt(1160000);
 let tipoBeneficiario=ref(0);
 let nombreBeneficiario=ref("Juan Julio Salgado Espinosa");
 let salarioDocente= ref(0);

 const salarioBeneficiario= computed(()=>{
 
  if( tipoBeneficiario.value== 1 ){
     return salarioMinimo;  
         
    }else {
      return salarioDocente.value
      }
  });
  
  let dias=ref(1);
  let pernoctar=ref(0);
  let distancia=ref(0);
  let viaticos= ref([]);
  let viaticosInter= ref([]);
  let transporteAereo= ref(0);
  let transporteTerrestre= ref(0);

  

  //Segun la distancio y si pasa la noche en otro lugar se define el multiplo por el cual se calcula
  //[Estado: Works]
  const multiplo=computed(()=>{
        let multiplo;
        //Viaticos plenos

        //Si se trabaja con movilidad internacional el multiplo siempre sera 1, esto con el fin de no afectar el valro
        //ya que no se define nada en la resolucion.
        if(movilidadInternacional.value==true){
          multiplo=1;
        }
        //Por le ocntraro la moviliad nacional esta regida por 2 caracteristicas y 4 estados de las mismas
        else{
           if(pernoctar.value && distancia.value){
                multiplo=1;
           }
        //Viaticos reducidos
          if(!pernoctar.value && distancia.value){
              multiplo=0.5;
          }
        //Zona de influencia
          if(!pernoctar.value && !distancia.value){
              multiplo=0.25;
          }
        //Zona de influencia pernoctar
          if(pernoctar.value && !distancia.value){
              multiplo=0.5;
          }
        }
        return parseFloat(Number(multiplo));
  });
  //Dentro de las tablas obtiene los valores maximos de movilidad 
  //[Estado: Works]
  const defRango = computed(()=>{

    let retorno=ref([])
    for(const value of rangosSalariales ){
        
      if(salarioBeneficiario.value >=value.valorMin && salarioBeneficiario.value <= value.valorMax){

        retorno.value.push(
          parseInt(value.pesos),
          parseInt(value.ext1),
          parseInt(value.ext2),
          parseInt(value.ext3)
        )
        break
      }

    }

    return retorno


  });


 //Añade elemetos preconfigurados a viaticos
  //[Estado: Refactorizar]
  const addViaticos=(dias, pernoctar, distancia, valor)=>{
        let ingresar = {};
        ingresar.dias= dias;
        ingresar.pernoctar = pernoctar;
        ingresar.distancia = distancia;
        ingresar.valor= valor;
        ingresar.sub= valor*dias
        viaticos.value.push(ingresar);
  }

  const addViaticosInternacionales=(destino, dias, valor)=>{
  let temporal={};
  temporal.destino= destino
  temporal.dias=dias
  temporal.valor=valor
  temporal.sub=valor*dias
  viaticosInter.value.push(temporal)
  };

 //Eliminar un registro de los viaticos
 //[Estado: Works]
  const  elimarItem=(item)=>{viaticos.value.splice(item,1)}
  const  elimarItemInter=(item)=>{viaticosInter.value.splice(item,1)}

  //Suma El total de los dias ya que seran usados para el transporte interno.
 //[Estado: Works]
 //Abastraccion: Posible
  const totalViaticosDias= computed(()=>{
      let total=0;
      for(let viatico of viaticos.value ){
        total+= viatico.dias;
      }
      return total;
  });


  const totalViaticosDiasI= computed(()=>{
      let total=0;
      for(let viatico of viaticosInter.value ){
        total+= viatico.dias;
      }
      return total;
  });
 // 
 
 /**
  * Origen: Resolucion
  * Estado: Terminado
  * Descripcion: devuelve el 2% o 1.5% segun los ingresas para realizar el calculo del
  * monto diario correspondiente al transporte interno.
  */
  const transporteInterno= computed(()=>{
    let j;
    if(totalViaticosDias.value && totalViaticosDias.value>0){

      if (salarioBeneficiario<=(salarioMinimo*3)){
        j=0.02;
      }else j=0.015;
     
      return totalViaticosDias.value*(j*salarioBeneficiario.value)
    }
  });

 //Suma El total de los valores de los viaticos, sera usado para el total favorable.
 //[Estado: Works]
 const totalViaticosValor= computed(()=>{
    let total=0;
    for(let viatico of viaticos.value ){
      total+= parseFloat(Number(viatico.sub));
    }
    return total
  });

  const totalViaticosValorI= computed(()=>{
    let total=0;
    for(let viatico of viaticosInter.value ){
      total+= parseFloat(Number(viatico.sub));
    }
    return total
  });
  
 //Suma El total de los valores de los viaticos, sera usado para el total favorable.
 //[Estado: ]
 const totalViaticosTransporte = computed(()=>{

  if(parseFloat(totalViaticosValor.value)>0 && parseFloat(transporteInterno.value)>0){ 
    return parseFloat(totalViaticosValor.value+transporteAereo.value+transporteTerrestre.value+transporteInterno.value)
  } else return 0

 });

 //abastracto: Yes
 function moneda(variable){

  const valor= new Intl.NumberFormat("es-CO",{style: 'currency',minimumFractionDigits: 2, currency: 'COP'}).format(variable); 

  return valor;
 }

 /** 
  * Almacena el historico de lo consultado
  * Estado: en Desarrollo
  * 
 */
 let datosPersistencia=ref([]);
 function persistencia(event){
  event.preventDefault(); 
  let temporal = {};
  temporal.totalDias= totalViaticosDias.value;
  temporal.nombreBeneficiario = nombreBeneficiario.value;
  temporal.totalValor = totalViaticosTransporte.value;
  temporal.interno= transporteInterno.value;
  temporal.aereo= transporteAereo.value;
  temporal.terrestre= transporteTerrestre.value;
  temporal.diasInternacional= totalViaticosDiasI.value;
  temporal.totalDolares=totalViaticosValorI.value;
  datosPersistencia.value.push(temporal);
  
  /**
   * Vaciar arreglos con el detalle de los viaticos
   */
  viaticos.value=[];
  viaticosInter.value=[];
  transporteAereo.value=0;
  transporteTerrestre.value=0;
  salarioDocente.value=0;
  nombreBeneficiario.value="Juan Julio Salgado Espinsa";
  //this.$refs.vitaCalcForm.reset();
 }


//movilidad internacionla: Pendiente
  let movilidadInternacional=ref(false); 
  let destinoInternacional=ref(0);
  
  //console.log(destinosInternacionales[destinosInternacionales][columna]);
 

 
  //EN CONSTRUCCION
  const indicadorColumna= computed(()=>{
  
    if(movilidadInternacional.value==false){
      return 0;
    }else{
      return getColumna(destinoInternacional.value);           
    }

  }); 
  
</script>

<template>
  <form class="container" ref="vitaCalcForm">

    <div class="row row-cols-auto">
        <div class="col-6 "><!-- BLOQUE 1 Datos del Beneficiario -->
          <h5>Datos del Beneficiario</h5>
          
          <h6>Tipo de Benefeficiario</h6>
          <div class="form-check form-switch">      
              <label class="form-check-label" >Estudiante</label>
              <input class="form-check-input"  type="checkbox" v-model="tipoBeneficiario">
          </div>

          <div class="row">
            <div class="col-lg-6 col-sm-12">
              <div class="form-floating">
                <input type="text" class="form-control" v-model="nombreBeneficiario">
                <label for="nombreBeneficiario">Nombre Beneficiario</label>
              </div>
            </div>

            <div class="col-lg-6 col-sm-12">
              <!-- Segun tipo de beneficioario se mostrara este contenido -->
              <div>
                <div class="form-floating" >
                    <input 
                      type="number" 
                      class="form-control"
                      min="0"                      
                      v-model="salarioDocente" 
                      :disabled="tipoBeneficiario==1">
                    <label>Salario</label>
                </div>         
              </div>                  
            </div>

            <div v-if="tipoBeneficiario==1">
              El salario de los estudiantes se toma como 1 SMLV
            </div>
          </div>
          <br>
          <!-- Datos del Beneficiario -->        
        
          <div><!-- Composicion de Detalle de los viaticos: CALCULO DE LOS VIATICOS -->
            <h5>Calculo de viaticos</h5>
            <div class="form-check form-switch">
              <label class="form-check-label" for="movilidadInternaciional">Internacional</label>
              <input class="form-check-input" type="checkbox" v-model="movilidadInternacional">             
            </div>
            
            <!--EN DESARROLO Internacional -->
              <div  class="row"><!--CARRO DE COMPRAS VIATICOS-->

              <div class="col-6" v-if="movilidadInternacional==false"><!--Movilidad Nacional-->
                <div class="form-check form-switch"><!---Pernoctar-->
                 <label class="form-check-label" for="calculadoraMovilidadInternorPernoctar">Pernoctacion</label>
                 <input class="form-check-input"  type="checkbox" id="calculadoraMovilidadInternorPernoctar" v-model="pernoctar">
                </div>
              
                <div class="form-check form-switch"><!---Distancia-->
                  <label class="form-check-label" for="calculadoraMovilidadInteriorDistancia"> Distancia Superior a 20 KM ?</label>
                  <input class="form-check-input" type="checkbox" id="calculadoraMovilidadInteriorDistancia" v-model="distancia">
                </div>
              </div>
              <div class="col-6" v-else>
                <div class="form-floating">


                </div>
                <label class="form-label">Destino</label>
                <select class="form-select form-select-sm" v-model="destinoInternacional" required>
                    <option disabled value="0">Select an option</option>
                    <option v-for="(destino, index) in destinosInternacionales" :value="index">{{ destino.destino }}</option>
                </select>  
               <!--
                <div class="form-floating">
                  

                   <input type="text" class="form-control"  list="countries" v-model="destinoInternacional">
                  <label>Destino</label> 
                </div>
                <datalist id="countries">
                  <option v-for="(country, index) in countries" :value="country.codigo_pais">{{country.nombre_pais}}, {{ country.nombre_continente }}</option>
                </datalist>-->
              </div>
              <div class="col-6"><!--Dias y Boton Guardar-->
                <div class="row">
                  <div class="col-4">
                    <div class="form-floating">
                      <input type="number" min="1" max="365" class="form-control" v-model="dias">
                      <label>Dias</label>
                    </div>
                  </div>

                  <div class="col-2" v-if="movilidadInternacional==false">
                    <button
                     type="button"
                     class="btn btn-outline-primary btn-sm"
                     @click="addViaticos(dias, pernoctar, distancia, defRango.value[indicadorColumna]*multiplo )"
                     :disabled="salarioBeneficiario==0" 
                     > Añadir</button>
                  </div>

                  <div class="col-2" v-else>
                    <button
                     type="button"
                     class="btn btn-outline-success btn-sm align-center"
                     @click="addViaticosInternacionales(destinoInternacional,dias,defRango.value[indicadorColumna]*multiplo)"
                     > Add</button>
                  </div>


                </div>
              </div>
            </div>
            
          </div>

                    
           <!-- Tipos de transporte -->
           <br>
          <h5>Datos de transporte </h5>

          <div class="row">
            <div class="col-lg-4 col-sm-6">
              <div class="form-floating"><!--TRANSPORTE INTERNO: READONLY-->
                <input type="number" class="form-control"   :value="transporteInterno" disabled >
                <label>Interno</label>
              </div>
            </div>

            <div class="col-lg-4 col-sm-6"> 
              <div class="form-floating"><!--TRANSPORTE TERRESTRE-->
                <input type="number" class="form-control" min="0"   v-model="transporteTerrestre" :disabled="movilidadInternacional==true">
                <label>Terrestre</label>
              </div>
            </div>
            <div class="col-lg-4 col-sm-6">
              <div class="form-floating"><!--TRANSPORTE AEREO-->
                <input type="number" class="form-control"  min="0" v-model="transporteAereo" :disabled="movilidadInternacional==true">
                <label>Aereo</label>
              </div>  
            </div>
          </div>

          <br>  
          <div>
            <h6>Tatal Viaticos y gastos de transporte: <span class="text-success">{{ moneda(totalViaticosTransporte) }}</span></h6>
          </div>

          <div class="d-grid gap-2">
          <button class="btn btn-success" @click="persistencia($event)">Nuevo Calculo</button>
          </div>

        
        </div>
        
        <div class="col-6"><!-- DETALLE VIATICOS -->
          <Transition name="slide-fade">        
            <div v-if="viaticos.length>0">
              <h5>Viaticos Nacionales</h5>
              <table class="table table-sm">

                <thead>
                  <tr class="table-gray">  
                    <th class="text-center">#</th>
                    <!-- <th >Movilidad</th> -->
                    <th>Dias</th>
                    <th>Perno..</th>
                    <th>Dist...</th>
                    <th>
                      <!-- <img src="./components/icons/bootstrap-icons/currency-dollar.svg" alt="Pesos" width="20" height="20"> -->
                      Valor</th>
                    <th>
                      <!-- <img src="./components/icons/bootstrap-icons/substack.svg" alt="Pesos" width="20" height="20">  -->
                      Sub Valor</th>
            
                    <th>Eliminar</th>
                  </tr>
                </thead>
                <tbody class="table-group-divider">
                  <!--Renderizado de lista -->   
                  <tr v-for="(viatico, index) in viaticos">
                    <th scope="row" class="text-center">{{index+1}}</th> 
                    <!-- <td hidden>{{movilidadInternacional ? "internacional" : "nacional"}}</td> -->
                    <td class="text-center">{{ viatico.dias }}</td>
                    
                    <td>{{ viatico.pernoctar? "Sí": "No" }}</td>
                    <td>{{ viatico.distancia? "Sí": "No" }} </td>
                    <td>{{ moneda(viatico.valor) }}</td>
                    <td>{{ moneda(viatico.sub) }}</td>
                    <td class="text-center">                                
                      <img src="./components/icons/bootstrap-icons/trash.svg" alt="eliminar" width="20" height="20" class="text-danger text-center" fill="currentColor" @click="elimarItem(index)" >
                    </td>
                  </tr>
                  <!--Totales de tabla-->
                  <tr class="">
                    <td colspan="6" class="text-center">Total: {{ moneda(totalViaticosValor)}}</td>              
                  </tr>
                </tbody>
              </table>
            </div>
          </Transition>
          
          <Transition name="slide-fade"> 
            <div v-if="viaticosInter.length>0">
              <h5>Viaticos Internacionales</h5>
              <table class="table table-sm">

                <thead>
                  <tr class="table-gray">  
                    <th class="text-center">#</th>
                    
                    <th>Dias</th>
                    <th >Destino</th>
                    <th>
                      <!-- <img src="./components/icons/bootstrap-icons/currency-dollar.svg" alt="Pesos" width="20" height="20"> -->
                      Valor</th>
                    <th>
                      <!-- <img src="./components/icons/bootstrap-icons/substack.svg" alt="Pesos" width="20" height="20">  -->
                      Sub Valor</th>
            
                    <th>Eliminar</th>
                  </tr>
                </thead>
                <tbody class="table-group-divider">
                  <!--Renderizado de lista -->   
                  <tr v-for="(viaticoI, index) in viaticosInter">
                    <th scope="row" class="text-center">{{ index+1 }}</th> 
                    <td class="text-center">{{ viaticoI.dias }}</td> 
                    <td class="text-center">{{ getDestino(viaticoI.destino) }}</td> 
                    <td>{{ viaticoI.valor }}</td>
                    <td>{{ viaticoI.sub}}</td>
                    <td class="text-center">                                
                      <img src="./components/icons/bootstrap-icons/trash.svg" alt="eliminar" width="20" height="20" class="text-danger text-center" fill="currentColor" @click="elimarItemInter(index)" >
                    </td>
                  </tr>
                  <!--Totales de tabla-->
                </tbody>
              </table>
            </div> 
        </Transition>
        </div>

    </div>
  </form>

  
  <div class="container"><!-- Muestra de persistencia -->
    <br>
    <h5>Historico </h5>
    <table class="table">
      <thead>
        <tr>
          <th scope="col" class="text-center">#</th>
          <th scope="col">Nombre</th>
          <th scope="col" class="text-center">Dias MN</th>
          <th scope="col" class="text-center">Transporte Interno</th>
          <th scope="col" class="text-center">Transporte Terrestre</th>
          <th scope="col" class="text-center">Transporte Aereo</th>
          <th scope="col" class="text-center">Valor Pesos</th>
          <th>Dias MI</th>
          <th>Valor Dolares</th>
        </tr>
      </thead>
        <tbody class="table-group-divider">
          <tr v-for="(dato, index) in datosPersistencia">
            <td class="text-center">{{ index +1}}</td>
            <td>{{ dato.nombreBeneficiario }}</td>
            <td class="text-center">{{ dato.totalDias }}</td>
            <td class="text-center">{{ moneda(dato.interno) }}</td>
            <td class="text-center">{{ moneda(dato.terrestre)}}</td> 
            <td class="text-center">{{ moneda(dato.aereo)}}</td>           
            <td class="text-center">{{ moneda(dato.totalValor) }}</td>    
            <td class="text-center">{{dato.diasInternacional}}</td> 
            <td class="text-center">{{dato.totalDolares}}</td>              
          </tr>
        </tbody>
      
    </table>

  </div>
</template>

<style scoped>
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.8s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(20px);
  opacity: 0;
}
</style>
