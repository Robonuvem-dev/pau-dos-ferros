package org.robonuvem.paudosferrospoc;
import android.app.Activity;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.os.Bundle;
import android.webkit.*;
import android.widget.*;
import android.view.ViewGroup;
public final class MainActivity extends Activity {
 private static final String HOST="pau-dos-ferros.lovable.app";
 private static final String BASE="https://"+HOST;
 private WebView web;
 private ScrollView nativeNews;
 private LinearLayout nativeContent;
 private org.json.JSONArray newsRows=new org.json.JSONArray();
 private final java.util.concurrent.ExecutorService worker=java.util.concurrent.Executors.newSingleThreadExecutor();
 private ValueCallback<Uri[]> upload;
 private TextView message;
 private boolean trusted(Uri u){ return "https".equals(u.getScheme()) && HOST.equals(u.getHost()) && u.getUserInfo()==null; }
 private void open(String path){nativeNews.setVisibility(android.view.View.GONE);web.setVisibility(android.view.View.VISIBLE);web.loadUrl(BASE+path);}
 private void external(Uri u){
  if(!java.util.Arrays.asList("https","mailto","tel").contains(u.getScheme()))return;
  try{startActivity(new Intent(Intent.ACTION_VIEW,u));}catch(Exception e){message.setText("Não há aplicativo para abrir este link.");}
 }
 @Override public void onCreate(Bundle saved){
  super.onCreate(saved);
  LinearLayout root=new LinearLayout(this);root.setOrientation(LinearLayout.VERTICAL);
  root.setOnApplyWindowInsetsListener((v,insets)->{v.setPadding(insets.getSystemWindowInsetLeft(),insets.getSystemWindowInsetTop(),insets.getSystemWindowInsetRight(),insets.getSystemWindowInsetBottom());return insets;});
  message=new TextView(this);message.setText("Pau dos Ferros — PoC · dados fictícios");message.setPadding(16,12,16,12);message.setBackgroundColor(Color.rgb(255,244,198));root.addView(message);
  HorizontalScrollView scroll=new HorizontalScrollView(this);
  LinearLayout buttons=new LinearLayout(this);
  String[] labels={"Notícias","Painel","Nova notícia","Editais","Fiscal","Leis","Decretos","Estatísticas","Voltar","Atualizar","Navegador"};
  String[] paths={"/noticias","/admin","/admin/noticias?novo=1","/admin/edital","/admin/lrf","/admin/lei","/admin/decreto","/admin",""};
  for(int i=0;i<labels.length;i++){
   final int index=i; Button b=new Button(this);b.setText(labels[i]);b.setAllCaps(false);
   b.setOnClickListener(v->{if(index==0){showNews();}else if(index==8){if(web.canGoBack())web.goBack();}else if(index==9){if(nativeNews.getVisibility()==android.view.View.VISIBLE)showNews();else web.reload();}else if(index==10)external(Uri.parse(web.getUrl()==null?BASE:web.getUrl()));else open(paths[index]);});
   buttons.addView(b);
  }
  scroll.addView(buttons);root.addView(scroll);
  web=new WebView(this);web.setContentDescription("Portal e gestão municipal");
  web.getSettings().setJavaScriptEnabled(true);web.getSettings().setDomStorageEnabled(true);
  web.getSettings().setAllowFileAccess(false);web.getSettings().setAllowContentAccess(true);
  web.getSettings().setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
  web.getSettings().setSupportMultipleWindows(false);
  CookieManager.getInstance().setAcceptCookie(true);
  CookieManager.getInstance().setAcceptThirdPartyCookies(web,false);
  web.setWebViewClient(new WebViewClient(){
   @Override public boolean shouldOverrideUrlLoading(WebView v,WebResourceRequest req){Uri u=req.getUrl();if(trusted(u))return false;if(req.isForMainFrame())external(u);return true;}
   @Override public void onPageFinished(WebView v,String url){message.setText("Pau dos Ferros — PoC · dados fictícios");}
   @Override public void onReceivedError(WebView v,WebResourceRequest r,WebResourceError e){if(r.isForMainFrame())message.setText("Sem conexão. Use Atualizar para tentar novamente.");}
  });
  web.setWebChromeClient(new WebChromeClient(){
   @Override public boolean onShowFileChooser(WebView view,ValueCallback<Uri[]> callback,FileChooserParams params){
    if(upload!=null)upload.onReceiveValue(null);
    upload=callback;
    Intent pick=new Intent(Intent.ACTION_OPEN_DOCUMENT);pick.addCategory(Intent.CATEGORY_OPENABLE);pick.setType("*/*");
    String[] types=params.getAcceptTypes();if(types.length>0&&!types[0].isEmpty())pick.putExtra(Intent.EXTRA_MIME_TYPES,types);
    pick.putExtra(Intent.EXTRA_ALLOW_MULTIPLE,params.getMode()==FileChooserParams.MODE_OPEN_MULTIPLE);
    try{startActivityForResult(pick,501);}catch(Exception e){upload.onReceiveValue(null);upload=null;}
    return true;
   }
  });
  web.setDownloadListener((url,agent,disposition,mime,length)->{Uri u=Uri.parse(url);if("https".equals(u.getScheme()))external(u);else message.setText("Para exportar arquivos, use Navegador e faça a exportação no portal.");});
  root.addView(web,new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT,0,1));
  nativeNews=new ScrollView(this);nativeContent=new LinearLayout(this);nativeContent.setOrientation(LinearLayout.VERTICAL);nativeContent.setPadding(24,16,24,16);nativeNews.addView(nativeContent);
  root.addView(nativeNews,new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT,0,1));setContentView(root);
  if(saved==null)showNews();else {open("/noticias");web.restoreState(saved);}
 }
 private void nativeText(String text,int size){TextView t=new TextView(this);t.setText(text);t.setTextSize(size);t.setPadding(0,10,0,14);t.setTextIsSelectable(true);nativeContent.addView(t);}
 private void showList(){
  nativeContent.removeAllViews();nativeText("Notícias de Pau dos Ferros",24);
  if(newsRows.length()==0)nativeText("Nenhuma notícia publicada.",16);
  for(int i=0;i<newsRows.length();i++){
   final org.json.JSONObject n=newsRows.optJSONObject(i);if(n==null)continue;
   Button b=new Button(this);b.setText(n.optString("titulo"));b.setAllCaps(false);b.setOnClickListener(v->showArticle(n));nativeContent.addView(b);
   nativeText(n.optString("resumo"),16);
  }
 }
 private void showNews(){
  web.setVisibility(android.view.View.GONE);nativeNews.setVisibility(android.view.View.VISIBLE);nativeContent.removeAllViews();nativeText("Carregando notícias...",18);
  worker.execute(()->{
   java.net.HttpURLConnection c=null;
   try{
    c=(java.net.HttpURLConnection)new java.net.URL(BASE+"/api/noticias").openConnection();c.setConnectTimeout(10000);c.setReadTimeout(10000);c.setInstanceFollowRedirects(false);
    if(c.getResponseCode()!=200)throw new java.io.IOException("Feed indisponível");
    java.io.ByteArrayOutputStream out=new java.io.ByteArrayOutputStream();
    try(java.io.InputStream in=c.getInputStream()){byte[] buf=new byte[8192];int n;while((n=in.read(buf))!=-1){if(out.size()+n>4*1024*1024)throw new java.io.IOException("Feed excede o limite");out.write(buf,0,n);}}
    org.json.JSONArray parsed=new org.json.JSONObject(out.toString("UTF-8")).getJSONArray("noticias");
    runOnUiThread(()->{if(!isDestroyed()){newsRows=parsed;showList();}});
   }catch(Exception e){runOnUiThread(()->{if(!isDestroyed()){nativeContent.removeAllViews();nativeText("Não foi possível carregar as notícias. Use Atualizar para tentar novamente.",18);}});}
   finally{if(c!=null)c.disconnect();}
  });
 }
 private void showArticle(org.json.JSONObject n){
  nativeContent.removeAllViews();Button back=new Button(this);back.setText("Voltar à lista de notícias");back.setOnClickListener(v->showList());nativeContent.addView(back);
  nativeText(n.optString("titulo"),24);nativeText(n.optString("publicado_em"),13);nativeText(n.optString("resumo"),18);
  nativeText(android.text.Html.fromHtml(n.optString("conteudo"),android.text.Html.FROM_HTML_MODE_LEGACY).toString(),17);
  Button media=new Button(this);media.setText("Ver mídias da publicação no portal");media.setOnClickListener(v->open("/noticias/"+Uri.encode(n.optString("slug"))));nativeContent.addView(media);
 }
 @Override protected void onActivityResult(int request,int result,Intent data){
  super.onActivityResult(request,result,data);
  if(request==501&&upload!=null){upload.onReceiveValue(WebChromeClient.FileChooserParams.parseResult(result,data));upload=null;}
 }
 @Override protected void onSaveInstanceState(Bundle out){web.saveState(out);super.onSaveInstanceState(out);}
 @Override public void onBackPressed(){if(web.canGoBack())web.goBack();else super.onBackPressed();}
 @Override protected void onDestroy(){if(upload!=null)upload.onReceiveValue(null);worker.shutdownNow();web.destroy();super.onDestroy();}
}
