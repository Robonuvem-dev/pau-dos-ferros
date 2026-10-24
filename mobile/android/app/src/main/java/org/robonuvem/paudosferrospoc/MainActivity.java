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
 private ValueCallback<Uri[]> upload;
 private TextView message;
 private boolean trusted(Uri u){ return "https".equals(u.getScheme()) && HOST.equals(u.getHost()) && u.getUserInfo()==null; }
 private void open(String path){web.loadUrl(BASE+path);}
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
   b.setOnClickListener(v->{if(index==8){if(web.canGoBack())web.goBack();}else if(index==9)web.reload();else if(index==10)external(Uri.parse(web.getUrl()==null?BASE:web.getUrl()));else open(paths[index]);});
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
  root.addView(web,new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT,0,1));setContentView(root);
  if(saved==null)open("/noticias");else web.restoreState(saved);
 }
 @Override protected void onActivityResult(int request,int result,Intent data){
  super.onActivityResult(request,result,data);
  if(request==501&&upload!=null){upload.onReceiveValue(WebChromeClient.FileChooserParams.parseResult(result,data));upload=null;}
 }
 @Override protected void onSaveInstanceState(Bundle out){web.saveState(out);super.onSaveInstanceState(out);}
 @Override public void onBackPressed(){if(web.canGoBack())web.goBack();else super.onBackPressed();}
 @Override protected void onDestroy(){if(upload!=null)upload.onReceiveValue(null);web.destroy();super.onDestroy();}
}
