import SwiftUI
import WebKit

@main struct PauDosFerrosApp: App {
 var body: some Scene { WindowGroup { PortalView() } }
}
@MainActor final class PortalModel: NSObject,ObservableObject,WKNavigationDelegate,WKUIDelegate {
 let web: WKWebView
 @Published var message = "Pau dos Ferros — PoC · dados fictícios"
 let host = "pau-dos-ferros.lovable.app"
 override init(){
  let config=WKWebViewConfiguration()
  config.websiteDataStore = .default()
  web=WKWebView(frame:.zero,configuration:config)
  super.init()
  web.navigationDelegate=self
  web.uiDelegate=self
  web.allowsBackForwardNavigationGestures=true
  open("/noticias")
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
 func webView(_ webView:WKWebView,didFinish navigation:WKNavigation!){message="Pau dos Ferros — PoC · dados fictícios"}
}
struct PortalWebView:UIViewRepresentable {
 let model:PortalModel
 func makeUIView(context:Context)->WKWebView{model.web}
 func updateUIView(_ uiView:WKWebView,context:Context){}
}
struct PortalView:View {
 @StateObject private var model=PortalModel()
 let links:[(String,String)]=[("Notícias","/noticias"),("Painel","/admin"),("Nova notícia","/admin/noticias?novo=1"),("Editais","/admin/edital"),("Fiscal","/admin/lrf"),("Leis","/admin/lei"),("Decretos","/admin/decreto"),("Estatísticas","/admin")]
 var body:some View {
  VStack(spacing:0){
   Text(model.message).font(.caption).padding(10).frame(maxWidth:.infinity).background(Color.yellow.opacity(0.25))
   ScrollView(.horizontal,showsIndicators:false){
    HStack{ForEach(links,id:\.0){item in Button(item.0){model.open(item.1)}};Button("Voltar"){model.web.goBack()};Button("Atualizar"){model.web.reload()};Button("Navegador"){if let u=model.web.url{UIApplication.shared.open(u)}}}.padding(10)
   }
   PortalWebView(model:model)
  }
 }
}
