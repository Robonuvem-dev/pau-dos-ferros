import SwiftUI
import WebKit

@main struct PauDosFerrosApp: App {
 var body: some Scene { WindowGroup { PortalView() } }
}
@MainActor final class PortalModel: NSObject,ObservableObject,WKNavigationDelegate,WKUIDelegate {
 let web: WKWebView
 @Published var message = ""
 let host = "pau-dos-ferros.lovable.app"
 override init(){
  let config=WKWebViewConfiguration()
  config.websiteDataStore = .default()
  web=WKWebView(frame:.zero,configuration:config)
  super.init()
  web.navigationDelegate=self
  web.uiDelegate=self
  web.allowsBackForwardNavigationGestures=true
  open("/")
 }
 func open(_ path:String){ if let url=URL(string:"https://"+host+path){web.load(URLRequest(url:url))} }
 func webView(_ webView:WKWebView,decidePolicyFor action:WKNavigationAction,decisionHandler:@escaping(WKNavigationActionPolicy)->Void){
  guard let url=action.request.url else{decisionHandler(.cancel);return}
  if url.scheme=="https" && url.host==host && url.user==nil{decisionHandler(.allow);return}
  if action.targetFrame?.isMainFrame != false && ["https","mailto","tel"].contains(url.scheme ?? "") {UIApplication.shared.open(url)}
  decisionHandler(.cancel)
 }
 func webView(_ webView:WKWebView,createWebViewWith configuration:WKWebViewConfiguration,for action:WKNavigationAction,windowFeatures:WKWindowFeatures)->WKWebView?{
  if let url=action.request.url {
   if url.scheme=="https" && url.host==host {webView.load(URLRequest(url:url))}
   else if url.scheme=="https" {UIApplication.shared.open(url)}
  }
  return nil
 }
 func webView(_ webView:WKWebView,didFailProvisionalNavigation navigation:WKNavigation!,withError error:Error){message="Sem conexão. Toque em Atualizar."}
 func webView(_ webView:WKWebView,didFinish navigation:WKNavigation!){message=""}
}
struct PortalWebView:UIViewRepresentable {
 let model:PortalModel
 func makeUIView(context:Context)->WKWebView{model.web}
 func updateUIView(_ uiView:WKWebView,context:Context){}
}
struct PortalView:View {
 @StateObject private var model=PortalModel()
 @State private var nativeNews=false
 @State private var newsRefresh=UUID()
 let links:[(String,String)]=[("Painel administrativo","/admin"),("Serviços","/servicos"),("Transparência","/transparencia"),("Ouvidoria / e-SIC","/esic"),("Nova notícia","/admin/noticias?novo=1"),("Editais","/admin/edital"),("Fiscal","/admin/lrf"),("Leis","/admin/lei"),("Decretos","/admin/decreto")]
 var body:some View {
  VStack(spacing:0){
   if !model.message.isEmpty {Text(model.message).font(.caption).padding(10).frame(maxWidth:.infinity).background(Color.yellow.opacity(0.25))}
   HStack {
    Button("Portal"){nativeNews=false;model.open("/")}.frame(maxWidth:.infinity,minHeight:44)
    Button("Notícias"){nativeNews=true}.frame(maxWidth:.infinity,minHeight:44)
    Menu {
     ForEach(links,id:\.0){item in Button(item.0){nativeNews=false;model.open(item.1)}}
     Divider()
     Button("Voltar"){if nativeNews {nativeNews=false;model.open("/")} else {model.web.goBack()}}
     Button("Atualizar"){if nativeNews {newsRefresh=UUID()} else {model.web.reload()}}
     Button("Abrir no navegador"){if let u=model.web.url{UIApplication.shared.open(u)}}
    } label: {Text("Menu").frame(maxWidth:.infinity,minHeight:44)}
   }.padding(.horizontal,8)
   if nativeNews { NativeNewsList().id(newsRefresh) } else { PortalWebView(model:model) }
  }
 }
}

struct NativeNewsItem:Decodable,Identifiable {
 let id:String
 let titulo:String?
 let slug:String?
 let resumo:String?
 let conteudo:String?
 let publicado_em:String?
}
struct NativeNewsFeed:Decodable {let noticias:[NativeNewsItem]}
@MainActor struct NativeNewsList:View {
 @State private var items:[NativeNewsItem]=[]
 @State private var message="Carregando notícias..."
 func load() async {
  do {
   var request=URLRequest(url:URL(string:"https://pau-dos-ferros.lovable.app/api/noticias")!);request.cachePolicy = .reloadIgnoringLocalCacheData;request.timeoutInterval=15
   let (data,response)=try await URLSession.shared.data(for:request)
   guard let http=response as? HTTPURLResponse,http.statusCode==200,data.count<=4*1024*1024 else {throw URLError(.badServerResponse)}
   let feed=try JSONDecoder().decode(NativeNewsFeed.self,from:data)
   items=feed.noticias;message=items.isEmpty ? "Nenhuma notícia publicada." : ""
  } catch {message="Não foi possível carregar as notícias. Toque em Tentar novamente."}
 }
 var body:some View {
  NavigationStack {
   List {
    if !message.isEmpty {Text(message);Button("Tentar novamente"){Task{await load()}}}
    ForEach(items){item in NavigationLink { NativeNewsArticle(item:item) } label: {VStack(alignment:.leading,spacing:6){Text(item.titulo ?? "Notícia").font(.headline);Text(item.resumo ?? "").font(.subheadline)}}}
   }.navigationTitle("Notícias").refreshable{await load()}.task{await load()}
  }
 }
}

@MainActor struct NativeNewsArticle:View {
 let item:NativeNewsItem
 @State private var counterError=""
 var body:some View {
  ScrollView {VStack(alignment:.leading,spacing:16){
   Text(item.titulo ?? "Notícia").font(.title).bold()
   Text(item.publicado_em ?? "").font(.caption)
   Text(item.resumo ?? "").font(.headline)
   Text((item.conteudo ?? "").replacingOccurrences(of:"<[^>]+>",with:"",options:.regularExpression)).textSelection(.enabled)
   if !counterError.isEmpty {Text(counterError).font(.caption)}
   if let slug=item.slug,let encoded=slug.addingPercentEncoding(withAllowedCharacters:.urlPathAllowed),let url=URL(string:"https://pau-dos-ferros.lovable.app/noticias/"+encoded) {Link("Ver mídias da publicação no portal",destination:url)}
  }.padding()}.navigationTitle("Notícia").navigationBarTitleDisplayMode(.inline).task {
   do {
    var request=URLRequest(url:URL(string:"https://pau-dos-ferros.lovable.app/api/noticias")!);request.httpMethod="POST";request.timeoutInterval=15;request.setValue("application/json",forHTTPHeaderField:"Content-Type")
    request.httpBody=try JSONSerialization.data(withJSONObject:["slug":item.slug ?? ""])
    let (_,response)=try await URLSession.shared.data(for:request)
    guard let http=response as? HTTPURLResponse,http.statusCode==200 else {throw URLError(.badServerResponse)}
   } catch {counterError="Leitura aberta; não foi possível registrar esta visualização."}
  }
 }
}
