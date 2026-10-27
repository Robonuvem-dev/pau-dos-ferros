/** Endpoint público de contador: aceita apenas leituras de uma notícia publicada. */
export async function handleNativeNewsView(request:Request,visit:(slug:string)=>Promise<boolean>):Promise<Response> {
  const origin=request.headers.get('origin');
  if(origin&&origin!==new URL(request.url).origin)return Response.json({error:'Origem inválida'},{status:403});
  if(!request.headers.get('content-type')?.startsWith('application/json'))return Response.json({error:'Use JSON'},{status:415});
  const reader=request.body?.getReader();if(!reader)return Response.json({error:'Corpo obrigatório'},{status:400});
  let size=0,text='';const decoder=new TextDecoder();
  for(;;){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>1024){await reader.cancel();return Response.json({error:'Corpo extenso'},{status:413});}text+=decoder.decode(value,{stream:true});}
  text+=decoder.decode();
  let slug:unknown;
  try {slug=(JSON.parse(text) as {slug?:unknown}).slug;}catch{return Response.json({error:'JSON inválido'},{status:400});}
  if(typeof slug!=='string'||!slug.trim()||slug.length>160)return Response.json({error:'Notícia inválida'},{status:400});
  try {
    if(!await visit(slug))return Response.json({error:'Notícia indisponível'},{status:404});
    return Response.json({ok:true},{headers:{'Cache-Control':'no-store'}});
  } catch{return Response.json({error:'Contador indisponível'},{status:503});}
}
