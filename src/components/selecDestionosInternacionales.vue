<script>
const destinosInternacionales=[
    {"destino":"Argentina", "columna":3},
    {"destino":"Europa","columna":3},
    {"destino":"Asia","columna":3},
    {"destino":"Oceanía","columna":3},
    {"destino":"Estados Unidos","columna":2},
    {"destino":"Canada","columna":2},
    {"destino":"Mexico","columna":2},
    {"destino":"Chile","columna":2},
    {"destino":"Brasil","columna":2},
    {"destino":"Puerto Rico","columna":2},
    {"destino":"Africa","columna":2},
    {"destino":"Centro America","columna":1},
    {"destino":"El caribe","columna":1},
    {"destino":"Suramerica","columna":1},
]
</script>

<template>
    
<select name="" id="">
    <option v-for="destino in destinosInternacionales" :value="destino.columna">{{ destino.destino }}</option>
</select>

</template>
