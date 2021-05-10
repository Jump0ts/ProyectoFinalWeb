import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { AppComponent } from 'src/app/app.component';
import { ControladorService } from 'src/app/services/controlador.service';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore' ;
import { app } from 'firebase';
import { Receta } from 'src/app/class/receta';
import { AngularFireAuth } from '@angular/fire/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-recetas',
  templateUrl: './recetas.page.html',
  styleUrls: ['./recetas.page.scss'],
})
export class RecetasPage implements OnInit {

  protected recetas: Receta[] = [];
  protected glutenFree: boolean = false;
  protected vegan: boolean = false;
  protected vegie: boolean = false;
  protected fishFree: boolean = false;
  protected sugarFree: boolean = false;
  protected saltFree: boolean = false;
  protected filtro: boolean = false;
  protected noVerificadas: boolean = false;
  protected favoritas: boolean = false;
  protected masTarde: boolean = false;
  protected todas: boolean = true;
  protected todoIniciado: boolean = true;
  protected nombre: string ="";
  
  constructor(public navCtrl: NavController, protected controlador: ControladorService, private afAuth: AngularFireAuth, private router: Router) { 
    
  }

  

  ngOnInit() {
    this.afAuth.authState.subscribe((user)=>{
      if(user == null){
        this.router.navigate(['/login']); 
      }
    });
  }

  ionViewWillEnter(){
    this.afAuth.authState.subscribe((user)=>{
      if(user == null){
        this.router.navigate(['/login']); 
      }
    });
    

    this.controlador.loadRecetas();
    this.recetas = this.controlador.getRecetas(true);

    if(this.todoIniciado=true && this.recetas.length!=0)this.buscar();
    this.todoIniciado=true;
    console.log(this.recetas.length!=0);
    
  }
  

  protected clickReceta(id){
    this.router.navigate(['/receta/'+id]);
  }

  protected buscar(){
    
    this.filtro = false;
    
    if(this.todas==true)this.copiarRecetas();
    else if(this.noVerificadas==true)this.mostrarNoVerificadas();
    else if(this.favoritas==true)this.mostrarFavoritas();
    else if(this.masTarde==true)this.mostrarMasTarde();

    
    if(this.vegan==true)this.isVegan();
    if(this.vegie==true)this.isVegie();
    if(this.fishFree==true)this.sinPescado();
    if(this.glutenFree==true)this.sinGluten();
    if(this.sugarFree==true)this.sinAzucar();
    if(this.saltFree==true)this.sinSal();
    if(this.nombre!="")this.buscarPorNombre();
    
    
  }
  
  private sinGluten(){
    this.filtro = true;
    for(let i = 0; i<this.recetas.length;i++){
        if(this.recetas[i].propiedades.indexOf("glutenFree")==-1){
          this.recetas.splice(i,1);
        }
    }
  }

  private sinAzucar(){
    this.filtro = true;
    
    for(let i = 0; i<this.recetas.length;i++){
      
        if(this.recetas[i].propiedades.indexOf("sugarFree")==-1){
          this.recetas.splice(i,1);
        }
      
    }
  }

  private sinSal(){
    this.filtro = true;
    
    for(let i = 0; i<this.recetas.length;i++){
      
        if(this.recetas[i].propiedades.indexOf("saltFree")==-1){
          this.recetas.splice(i,1);
        }
      
    }
  }

  private isVegan(){
    this.filtro = true;
    for(let i = 0; i<this.recetas.length;i++){
        if(this.recetas[i].propiedades.indexOf("vegan")==-1){
          this.recetas.splice(i,1);
        }
    }
  }

  private isVegie(){
    this.filtro = true;
    for(let i = 0; i<this.recetas.length;i++){
        if(this.recetas[i].propiedades.indexOf("vegie")==-1){
          this.recetas.splice(i,1);
        }
    }
  }

  private sinPescado(){
    this.filtro = true;
    for(let i = 0; i<this.recetas.length;i++){
        if(this.recetas[i].propiedades.indexOf("fishFree")){
          this.recetas.splice(i,1);
        }
    }
  }

  protected mostrarNoVerificadas(){
    this.recetas=[];

    this.noVerificadas = true;
    this.todas = false;
    this.favoritas = false;
    this.masTarde = false;

    this.controlador.getRecetas(false).forEach(receta=>{
      this.recetas.push(receta);
    });
  }

  protected mostrarFavoritas(){
    this.recetas=[];

    this.noVerificadas = false;
    this.todas = false;
    this.favoritas = true;
    this.masTarde = false;

    this.controlador.getUsuario().favoritas.forEach(receta=>{
      this.recetas.push(receta);
    });
  }

  protected mostrarMasTarde(){
    this.recetas=[];

    this.noVerificadas = false;
    this.todas = false;
    this.favoritas = false;
    this.masTarde = true;
    
    this.controlador.getUsuario().masTarde.forEach(receta=>{
      this.recetas.push(receta);
    });
  }

  private buscarPorNombre(){
    this.filtro = true;
    for(let i = 0; i<this.recetas.length;i++){
      if(this.recetas[i].titulo.toUpperCase().indexOf(this.nombre.toUpperCase())==-1){
        this.recetas.splice(i,1);
      }
    }
  }

  protected copiarRecetas(){
    this.recetas = [];

    this.noVerificadas = false;
    this.todas = true;
    this.favoritas = false;
    this.masTarde = false;

    this.controlador.getRecetas(true).forEach(receta=>{
      this.recetas.push(receta);
    });
    
    this.recetas.sort(function(a,b){
      let array1 = a.fecha.split("-");
      let array2 = b.fecha.split("-");
      let numero1 = parseInt(array1[0])*365+parseInt(array1[1])*30+parseInt(array1[2]);
      let numero2 = parseInt(array2[0])*365+parseInt(array2[1])*30+parseInt(array2[2]);


      return numero2-numero1;

    });
    
    
  }

  protected ordenarLikes(){
    this.recetas.sort(function(a,b){
      return b.likes.length-a.likes.length;
    })
  }

  protected anadirMasTarde(receta: Receta){
    this.controlador.masTarde(true, receta);
  }
  
  protected quitarMasTarde(receta: Receta){
    this.controlador.masTarde(false, receta);
    this.recetas.splice(this.recetas.indexOf(receta),1);
  }
}
