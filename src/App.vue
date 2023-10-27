<script setup>

  import {ref, computed}  from "vue";
  // Import Bootstrap and BootstrapVue CSS files (order is important)
  import 'bootstrap/dist/css/bootstrap.css'
  import 'bootstrap-vue/dist/bootstrap-vue.css'
 // import countries from "../src/components/json/paises.json";
  import rangosSalariales from "../src/components/rangosSalariales.js"


 let calculadoraTipoBeneficiario=ref(0);
 const salarioMinimo= parseInt(1160000);

 let salarioDocente= ref(0);

  //Realiza un switch entre el el SMLV y un salario Docente
  //[Estado: Works]
 const salarioBeneficiario= computed(()=>{
 
  if( calculadoraTipoBeneficiario.value== 1 ){
     return salarioMinimo;  
         
    }else {
      return salarioDocente.value
      }
  });
  
  let dias=ref(1);
  let pernoctar=ref(0);
  let distancia=ref(0);
  const viaticos= ref([]);
  let transporteAereo= ref(0);
  let transporteTerrestre= ref(0);
  let nombreBeneficiario=ref("Juan Julio Salgado Espinosa");

  //movilidad internacionla: Pendiente
    let movilidadInternacional=ref(false); 
    const ext2={paises:[302,301,303,344,6,391],continente:[3] } ;
    const ext3={paises:[340], contienente:[1,2,7,8]} 
    const ext1={paises:[], contienente:[4,5,6]}
    let destinoInternacional=ref(3)
    function determinarExtension(ext){

      if(ext2.paises.includes(ext.pais)){
        return 2
      }else if(ext2.continente.includes(ext.continente)){
        return 2
      }else if(ext3.paises.includes(ext.pais)){
        return 3
      } else if(ext3.contienente.includes(ext.continente)){
        return 3
      }else return 1
    }
  //fin movilidad internaciona-

  //Segun la distancio y si pasa la noche en otro lugar se define el multiplo por el cual se calcula
  //[Estado: Works]
  const multiplo=computed(()=>{
        let multiplo;
        //Viaticos plenos
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

  //EN CONSTRUCCION
  const tipoViatico= computed(()=>{

    if(movilidadInternacional.value==false){

      return defRango.value[0];
    }else{
      
      return  defRango[determinarExtension(destinoInternacional)];
      
    }

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
 //Eliminar un registro de los viaticos
 //[Estado: Works]
  const  elimarItem=(item)=>{viaticos.value.splice(item,1)}
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
 // 
 //[Estado: Works]
  const transporteInterno= computed(()=>{
    if(totalViaticosDias.value && totalViaticosDias.value>0){
      return totalViaticosDias.value*(0.02*salarioBeneficiario.value)
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

const viaticosMoneda= computed(()=>{
  return moneda(totalViaticosTransporte.value)
});

let datosPersistencia=ref([]);
function presistencia(event){
  event.preventDefault(); 
  let temporal = {};
  temporal.totalDias= totalViaticosDias.value;
  temporal.nombreBeneficiario = nombreBeneficiario.value;
  temporal.totalValor = totalViaticosTransporte.value;
  datosPersistencia.value.push(temporal);
  viaticos.value=[];
  //this.$refs.vitaCalcForm.reset();
}
</script>

<template>
  <form class="container" ref="vitaCalcForm">

    <div class="row row-cols-auto">
        <div class="col-6 "><!-- BLOQUE 1 Datos del Beneficiario -->
          <h5>Datos del Beneficiario</h5>
          
          <h6>Tipo de Benefeficiario</h6>
          <div class="form-check form-switch">      
              <label class="form-check-label" >Estudiante</label>
              <input class="form-check-input"  type="checkbox" v-model="calculadoraTipoBeneficiario">
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
                      id="calculadoraSalarioBeneficiaro"  
                      v-model="salarioDocente" 
                      :disabled="calculadoraTipoBeneficiario==1">
                    <label for="calculadoraSalarioBeneficiaro">Salario</label>
                </div>         
              </div>                  
            </div>

            <div v-if="calculadoraTipoBeneficiario==1">
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
              <div>{{ movilidadInternacional }}</div>
              
            </div>
            
            <!--EN DESARROLO Internacional -->
              <div  class="row"><!--CARRO DE COMPRAS VIATICOS-->

              <div class="col-6" v-show="movilidadInternacional==false"><!--Movilidad Nacional-->
                <div class="form-check form-switch"><!---Pernoctar-->
                 <label class="form-check-label" for="calculadoraMovilidadInternorPernoctar">Pernoctacion</label>
                 <input class="form-check-input"  type="checkbox" id="calculadoraMovilidadInternorPernoctar" v-model="pernoctar">
                </div>
              
                <div class="form-check form-switch"><!---Distancia-->
                  <label class="form-check-label" for="calculadoraMovilidadInteriorDistancia"> Distancia Superior a 20 KM ?</label>
                  <input class="form-check-input" type="checkbox" id="calculadoraMovilidadInteriorDistancia" v-model="distancia">
                </div>
              </div>
              <div class="col-6" v-show="movilidadInternacional==true">  
                Datos internacionales
              </div>
              <div class="col-6"><!--Dias y Boton Guardar-->
                <div class="row">
                  <div class="col-4">
                    <div class="form-floating">
                      <input type="number" class="form-control" id="calculadoraMovilidadInteriorDias" placeholder="" v-model="dias">
                      <label for="calculadoraMovilidadInteriorDias">Dias</label>
                    </div>
                  </div>

                  <div class="col-2">
                    <button
                     type="button"
                     class="btn btn-outline-primary btn-sm"
                     @click="addViaticos(dias, pernoctar, distancia, defRango.value[0]*multiplo )"
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
                <input type="number" class="form-control" id="transporteInterno"  :value="transporteInterno" disabled >
                <label for="transporteInterno">Interno</label>
              </div>
            </div>

            <div class="col-lg-4 col-sm-6"> 
              <div class="form-floating"><!--TRANSPORTE TERRESTRE-->
                <input type="number" class="form-control" id="transporteTerrestre"  v-model="transporteTerrestre" >
                <label for="transporteTerrestre">Terrestre</label>
              </div>
            </div>
            <div class="col-lg-4 col-sm-6">
              <div class="form-floating"><!--TRANSPORTE AEREO-->
                <input type="number" class="form-control" id="transporteAereo"  v-model="transporteAereo">
                <label for="transporteAereo">Aereo</label>
              </div>  
            </div>
          </div>

          <br>  
          <div>
            <h6>Tatal Viaticos y gastos de transporte: <span class="text-success">{{ viaticosMoneda }}</span></h6>
          </div>

          <div class="d-grid gap-2">
          <button class="btn btn-success" @click  ="presistencia($event)">Nuevo Calculo</button>
          </div>

        
        </div>
        
        <div class="col-6"><!-- DETALLE VIATICOS -->
          <div><!-- Renderizado de los viaticos -->
            <h5>Detalle de los viaticos</h5>
            <table class="table table-sm">

              <thead>
                  <tr class="table-gray">  
                    <th class="text-center">#</th>             
                  <th>Dias</th>
                  <th hidden>Movilidad</th>
                  <th>
                   Perno..
                  </th>
                  <th>Dist...</th>
                  <th><img src="./components/icons/bootstrap-icons/currency-dollar.svg" alt="Pesos" width="20" height="20">Diario</th>
                  <th><img src="./components/icons/bootstrap-icons/substack.svg" alt="Pesos" width="20" height="20"> Subtotal</th>
                  <th>Eliminar</th>
                </tr>
              </thead>
              <tbody class="table-group-divider">
                <!--Renderizado de lista -->   
                <tr v-for="(viatico, index) in viaticos">
                  <th scope="row" class="text-center">{{index+1}}</th> 
                  <td class="text-center">{{ viatico.dias }}</td>
                  <td hidden>{{movilidadInternacional ? "internacional" : "nacional :"}}</td>
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
        </div>

    </div>
    <div class="row">
      <!-- CONSTRUCCION VIATICOS -->
      <div class="col">   
      </div>
      <!-- DETALLE DE LOS DATOS OBTENIDOS -->
      <div class="col" hidden>
        <h5>Detale de los calculos</h5>
        <p>Tipo de beneficiario {{  calculadoraTipoBeneficiario }}</p>
        <p>Salario para calculo: {{salarioBeneficiario}}</p>        
        <p>Va a percnotar ? {{ pernoctar}}</p>
        <p>Cual es la distancia ? {{distancia}}</p>      
        <p>El multiplo es  {{ multiplo }}</p>
        <p>Rangos Salariales: {{ defRango }}</p> 
        <p>Valor disponible para este funcionario Pesos {{defRango.value[0]*multiplo }}</p>
        <p>Valor dependiendo de la movilidad: {{tipoViatico}}</p>
        <p>Tatal Viaticos y gastos de transporte: {{ viaticosMoneda }}</p>
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
          <th scope="col" class="text-center">Total Dias</th>
          <th scope="col" class="text-center">Total Valor</th>
        </tr>
      </thead>
        <tbody class="table-group-divider">
          <tr v-for="(dato, index) in datosPersistencia">
            <td>{{ index +1}}</td>
            <td>{{ dato.nombreBeneficiario }}</td>
            <td class="text-center">{{ dato.totalDias }}</td>
            <td class="text-center">{{  moneda(dato.totalValor) }}</td>
          
          </tr>
        </tbody>
      
    </table>

  </div>
</template>

<style scoped>
</style>
