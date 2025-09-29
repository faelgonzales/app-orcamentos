// ==== Variáveis ====
const clientes = [];
let materiais = [];
let orcamentos = [];
let editandoCliente = null;
let editandoOrcamento = null;
let orcamentoVisualizado = null;

const materiaisDB = {
  "Cabos": ["1,5mm", "2,5mm", "4mm", "6mm", "10mm", "16mm"],
  "Tomadas": ["10A Branca", "20A Branca", "20A Vermelha"],
  "Interruptores": ["Simples", "Paralelo", "Intermediário"],
  "Disjuntores": ["10A", "16A", "20A", "32A", "50A"],
  "Caixas e Conduítes": ["Caixa 4x4","Caixa 6x6","Conduíte 16mm","Conduíte 20mm"],
  "Iluminação": ["LED 9W","LED 12W","Plafon 18W"],
  "Fios e Acessórios": ["Fita Isolante","Eletroduto Flexível","Terminal de Conexão","Parafuso"],
  "Outros": []
};

// ==== Elementos ====
const categoriaSelect = document.getElementById("categoriaMaterial");
const nomeMaterialSelect = document.getElementById("nomeMaterial");
const materialCustom = document.getElementById("materialCustom");

// Preenche categorias
Object.keys(materiaisDB).forEach(cat => {
  const opt = document.createElement("option");
  opt.value = cat;
  opt.textContent = cat;
  categoriaSelect.appendChild(opt);
});

// Função que atualiza os nomes de materiais
function popularNomeMaterial() {
  nomeMaterialSelect.innerHTML = "";
  const cat = categoriaSelect.value;
  if(cat === "Outros") {
    nomeMaterialSelect.style.display="none";
    materialCustom.style.display="block";
  } else {
    nomeMaterialSelect.style.display="block";
    materialCustom.style.display="none";
    materiaisDB[cat].forEach(mat=>{
      const opt = document.createElement("option");
      opt.value = mat;
      opt.textContent = mat;
      nomeMaterialSelect.appendChild(opt);
    });
  }
}
categoriaSelect.addEventListener("change", popularNomeMaterial);
popularNomeMaterial();

// ==== Funções auxiliares ====
function atualizarClientes() {
  const select = document.getElementById("selectCliente");
  select.innerHTML='<option value="">-- Novo Cliente --</option>';
  clientes.forEach(c=>{
    const opt = document.createElement("option");
    opt.value = c.id;
    opt.textContent = c.nome;
    select.appendChild(opt);
  });

  const lista = document.getElementById("clientesLista");
  lista.innerHTML="";
  clientes.forEach(c=>{
    const div = document.createElement("div");
    div.className="material-item";
    div.innerHTML = `<span>${c.nome} - ${c.telefone}</span>
                     <div class="actions">
                      <button class="btn" onclick="editarCliente(${c.id})">✏️</button>
                      <button class="btn danger" onclick="excluirCliente(${c.id})">🗑️</button>
                     </div>`;
    lista.appendChild(div);
  });
}

window.editarCliente = function(id) {
  const c = clientes.find(x=>x.id===id);
  if(!c) return;
  editandoCliente = id;
  document.getElementById("clienteNome").value=c.nome;
  document.getElementById("clienteTelefone").value=c.telefone;
  document.getElementById("clienteRua").value=c.rua;
  document.getElementById("clienteNumero").value=c.numero;
  document.getElementById("clienteBairro").value=c.bairro;
};

window.excluirCliente = function(id){
  clientes.splice(clientes.findIndex(c=>c.id===id),1);
  atualizarClientes();
};

// Adicionar cliente
document.getElementById("btnAddCliente").addEventListener("click",()=>{
  const nome=document.getElementById("clienteNome").value.trim();
  if(!nome) return alert("Informe o nome do cliente");
  const telefone=document.getElementById("clienteTelefone").value.trim();
  const rua=document.getElementById("clienteRua").value.trim();
  const numero=document.getElementById("clienteNumero").value.trim();
  const bairro=document.getElementById("clienteBairro").value.trim();

  if(editandoCliente) {
    const idx = clientes.findIndex(c=>c.id===editandoCliente);
    clientes[idx] = {id:editandoCliente,nome,telefone,rua,numero,bairro};
    editandoCliente=null;
  } else {
    clientes.push({id:Date.now(),nome,telefone,rua,numero,bairro});
  }
  atualizarClientes();
  document.getElementById("clienteNome").value="";
  document.getElementById("clienteTelefone").value="";
  document.getElementById("clienteRua").value="";
  document.getElementById("clienteNumero").value="";
  document.getElementById("clienteBairro").value="";
});

// ==== Materiais ====
function atualizarMateriais(){
  const lista = document.getElementById("materiaisLista");
  lista.innerHTML="";
  materiais.forEach((m,i)=>{
    const qtdExibir = (m.categoria==="Cabos" || m.categoria==="Caixas e Conduítes")? m.quantidade+" (mt)" : m.quantidade;
    const div = document.createElement("div");
    div.className="material-item";
    div.innerHTML = `<span>${m.categoria} - ${m.nome} | Qtd: ${qtdExibir} | R$ ${m.valor.toFixed(2)}</span>
                     <div class="actions">
                      <button class="btn" onclick="removerMaterial(${i})">❌</button>
                     </div>`;
    lista.appendChild(div);
  });
}

window.removerMaterial=function(i){
  materiais.splice(i,1);
  atualizarMateriais();
  recalcularTotal();
};

// Adicionar material
document.getElementById("btnAddMaterial").addEventListener("click",()=>{
  const categoria=categoriaSelect.value;
  const nome=categoria==="Outros"?materialCustom.value.trim():nomeMaterialSelect.value;
  const qtd=parseFloat(document.getElementById("quantidadeMaterial").value||0);
  const valor=parseFloat(document.getElementById("valorUnitario").value||0);
  if(!nome || qtd<=0 || valor<=0) return alert("Preencha corretamente os campos de material");
  materiais.push({categoria,nome,quantidade:qtd,valor});
  atualizarMateriais();
  recalcularTotal();
  document.getElementById("quantidadeMaterial").value="";
  document.getElementById("valorUnitario").value="";
  document.getElementById("materialCustom").value="";
});

// ==== Total ====
function recalcularTotal(){
  const total = materiais.reduce((acc,m)=>acc+m.valor*m.quantidade,0) + parseFloat(document.getElementById("maoDeObra").value||0);
  document.getElementById("valorTotal").innerText=total.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2});
}
document.getElementById("maoDeObra").addEventListener("input",recalcularTotal);

// ==== Orçamentos ====
function atualizarOrcamentos(){
  const lista=document.getElementById("orcamentosLista");
  lista.innerHTML="";
  orcamentos.forEach(o=>{
    const div=document.createElement("div");
    div.className="orcamento-item";
    div.innerHTML=`<span>${o.cliente.nome} - Total: R$ ${calcularTotal(o).toFixed(2)}</span>
                   <div class="actions">
                     <button class="btn" onclick="visualizarOrcamento(${o.id})">👁️</button>
                     <button class="btn" onclick="editarOrcamento(${o.id})">✏️</button>
                     <button class="btn danger" onclick="excluirOrcamento(${o.id})">🗑️</button>
                   </div>`;
    lista.appendChild(div);
  });
}

function calcularTotal(o){
  const matTotal = o.materiais.reduce((acc,m)=>acc+m.valor*m.quantidade,0);
  return matTotal+o.maoDeObra;
}

// Salvar orçamento
document.getElementById("btnSalvarOrcamento").addEventListener("click",()=>{
  const clienteId=document.getElementById("selectCliente").value;
  const cliente=clientes.find(c=>c.id==clienteId);
  if(!cliente) return alert("Selecione um cliente");
  const maoDeObra=parseFloat(document.getElementById("maoDeObra").value||0);
  const obs=document.getElementById("observacoes").value||"";
  const orcamento={id:editandoOrcamento||Date.now(),cliente,materiais:[...materiais],maoDeObra,observacoes:obs};
  if(editandoOrcamento){
    const idx=orcamentos.findIndex(o=>o.id===editandoOrcamento);
    orcamentos[idx]=orcamento;
    editandoOrcamento=null;
  } else orcamentos.push(orcamento);
  materiais=[];
  document.getElementById("maoDeObra").value="";
  document.getElementById("observacoes").value="";
  atualizarMateriais();
  recalcularTotal();
  atualizarOrcamentos();
  if(orcamentoVisualizado===orcamento.id) visualizarOrcamento(orcamento.id);
});

// Visualizar
window.visualizarOrcamento=function(id){
  const o=orcamentos.find(x=>x.id===id);
  if(!o) return;
  orcamentoVisualizado=id;
  const div=document.getElementById("orcamentoPreview");
  let html=`<h2>⚡ ORÇAMENTO ⚡</h2>
            <p><b>Cliente:</b> ${o.cliente.nome}</p>
            <p><b>Telefone:</b> ${o.cliente.telefone}</p>
            <p><b>Endereço:</b> ${o.cliente.rua}, ${o.cliente.numero} - ${o.cliente.bairro}</p>
            <hr>
            <p><b>Mão de Obra:</b> R$ ${o.maoDeObra.toFixed(2)}</p>
            <h3>Materiais</h3><ul>`;
  o.materiais.forEach(m=>{
    const qtdExibir = (m.categoria==="Cabos"||m.categoria==="Caixas e Conduítes")? m.quantidade+" (mt)" : m.quantidade;
    html+=`<li>${m.categoria} - ${m.nome} | Qtd: ${qtdExibir} | R$ ${(m.valor*m.quantidade).toFixed(2)}</li>`;
  });
  html+=`</ul><hr><p><b>Observações:</b> ${o.observacoes}</p>
         <h3>Total: R$ ${calcularTotal(o).toFixed(2)}</h3>`;
  div.innerHTML=html;
};

// Editar orçamento
window.editarOrcamento=function(id){
  const o=orcamentos.find(x=>x.id===id);
  if(!o) return;
  editandoOrcamento=id;
  document.getElementById("selectCliente").value=o.cliente.id;
  document.getElementById("maoDeObra").value=o.maoDeObra;
  document.getElementById("observacoes").value=o.observacoes;
  materiais=[...o.materiais];
  atualizarMateriais();
  recalcularTotal();
};

// Excluir orçamento
window.excluirOrcamento=function(id){
  orcamentos=orcamentos.filter(o=>o.id!==id);
  atualizarOrcamentos();
  if(orcamentoVisualizado===id){
    document.getElementById("orcamentoPreview").innerHTML="";
    orcamentoVisualizado=null;
  }
};

// Exportar imagem
document.getElementById("btnExportarImagem").addEventListener("click",()=>{
  const div=document.getElementById("orcamentoPreview");
  if(!div.innerHTML.trim()) return alert("Visualize um orçamento antes de exportar.");
  html2canvas(div,{scale:2}).then(canvas=>{
    const link=document.createElement("a");
    link.download="orcamento.png";
    link.href=canvas.toDataURL();
    link.click();
  });
});
