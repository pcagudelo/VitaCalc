export const destinosInternacionales=[
    {"destino":"Argentina", "columna":3},
    {"destino":"Brasil","columna":2},
    {"destino":"Canada","columna":2},
    {"destino":"Chile","columna":2},
    {"destino":"Estados Unidos","columna":2},
    {"destino":"Mexico","columna":2},
    {"destino":"Puerto Rico","columna":2},
    {"destino":"Africa","columna":2},
    {"destino":"Asia","columna":3},
    {"destino":"Centro America","columna":1},
    {"destino":"El caribe","columna":1},
    {"destino":"Europa","columna":3},
    {"destino":"Oceanía","columna":3},
    {"destino":"Suramerica","columna":1}
];


export function getColumna(index){

    return destinosInternacionales[index].columna;
}

export const getDestino=(index)=>{
    return destinosInternacionales[index].destino;
}

