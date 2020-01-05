const express = require('express')
const app = express()
const bodyParser = require('body-parser')

//modulo de nodes para lidar com caminhos
const path=require('path')

const sqlite= require('sqlite')
const dbConnection = sqlite.open(path.resolve (__dirname,'banco.sqlite'),{Promise})

app.set('view engine','ejs')
app.use(express.static(path.join(__dirname,'public')))
//tudo que passar app do express ele vai passar pelo bodyparser vai tentar entender
//extend extender tipos que vem do form alem de string e vetores
app.use(bodyParser.urlencoded({extended:true}))

//callback - chama a funcionalidade - fc
app.get('/',async(request,response)=>{
    const db = await dbConnection
    const categoriasDB = await db.all('select * from categorias;')
    const vagas = await db.all('select * from vagas;')

    //ORGANIZANDO ANTES DE MANDAR PARA EJS
    //map pega todas categorias mapeando de um lado para outro 

    const categorias = categoriasDB.map(cat =>{
        return{
            //objeto ... spredoperator espalhar pegar cada item da categoria e espalhar para objeto cat
            ...cat,
            //filtrar as vagas para objeto vagas - anda no vetor filtrando as vagas de certa categoria.
            vagas: vagas.filter(vaga=> vaga.categoria ===cat.id)}

        })
    //console.log(new Date())
    //console.log(categorias)
   //response.send( '<h1>Olá fullstack</h1>')
     response.render('home',{
         categorias,
        // date: new Date()
        })
})


app.get('/vaga/:id',async(request,response)=>{
    //console.log(new Date(),
    //console.log(request.params.id)
    const db = await dbConnection
    const vaga = await db.get('select * from vagas where id = '+request.params.id)
    //console.log(vaga)
    response.render('vaga',{vaga})

})

app.get('/admin',(req,res)=>{
    res.render('admin/home')
    
})

app.get('/admin/vagas',async(req,res)=>{
    const db = await dbConnection
    const vagas = await db.all('select * from vagas;')
    res.render('admin/vagas',{vagas})
})

app.get('/admin/vagas/delete/:id',async(req,res)=>{
    const db =await dbConnection
    await db.run('delete from vagas where id='+req.params.id+'')
    res.redirect('/admin/vagas')   
})


app.get('/admin/vagas/nova',async(req,res)=>{
    const db = await dbConnection
    const categorias = await db.all('select * from categorias')
    res.render('admin/nova-vaga',{categorias})
})







app.post('/admin/vagas/nova',async(req,res)=>{
   //destruction assament
   const{titulo,descricao,categoria} = req.body
    //const titulo = 'Social Media (San Francisco)'
    //const descricao='Vaga para social media'
    const db = await dbConnection
    await db.run(`insert into vagas(categoria,titulo,descricao) values ('${categoria}','${titulo}','${descricao}')`)
   
    //devolver pra tela so dados que veio atraves do form
    //res.send(req.body)
    res.redirect('/admin/vagas')
})


app.get('/admin/vagas/editar/:id',async(req,res)=>{
    const db = await dbConnection
    const categorias = await db.all('select * from categorias')
    const vaga = await db.get('select * from vagas where id= '+req.params.id)
    res.render('admin/editar-vaga',{categorias,vaga})
})


//passando para externo
const port = process.env.PORT || 3000

app.set('views',path.join(__dirname,'views'))
app.post('/admin/vagas/editar/:id',async(req,res)=>{
    //destruction assament
    const{titulo,descricao,categoria} = req.body
    const{id} = req.params
     //const titulo = 'Social Media (San Francisco)'
     //const descricao='Vaga para social media'
     const db = await dbConnection
     await db.run(`update vagas set categoria=${categoria},titulo='${titulo}',descricao='${descricao}' where id =${id}`)
    
     //devolver pra tela so dados que veio atraves do form
     //res.send(req.body)
     res.redirect('/admin/vagas')
 })
//sqllite

const init = async()=>{
    const db = await dbConnection
    await db.run('create table if not exists categorias (id INTEGER PRIMARY KEY, categoria TEXT);')
    await db.run('create table if not exists vagas (id INTEGER PRIMARY KEY, categoria INTEGER,titulo TEXT, descricao TEXT);')
    //const categoria = 'Marketing team'
    //´´ permite usar template string para passar valores com dados para coluna da tabela
    //await db.run(`insert into categorias(categoria) values ('${categoria}')`)
    //const vaga = 'Social Media (San Francisco)'
    //const descricao='Vaga para social media'
    //await db.run(`insert into vagas(categoria,titulo,descricao) values (2,'${vaga}','${descricao}')`)
}

init()


app.listen(port,(err)=>
{   if(err){
        console.log('Não foi possivel iniciar o servidor jobify')

    }else
    {   
        console.log('Servidor jobify rodando...')
    }

})

