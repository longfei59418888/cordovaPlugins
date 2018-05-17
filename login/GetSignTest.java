package xiao.cordova.list.sign;

import android.content.Context;
import android.content.SharedPreferences;

import com.example.hello.Utils;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;
import org.json.JSONArray;
import org.json.JSONException;


/**
 * This class echoes a string called from JavaScript.
 */
public class GetSignTest extends CordovaPlugin {

    public static final String WXL_LOCAL_STORAGE_DATA = "wxl_local_storage_data";
    public static final String LOCAL_STORAGE_TOKEN = "local_storage_token";
//    private static final String WXL_LOCAL_STORAGE_DATA = "wxl_local_storage_data";

//    Context context = cordova.getContext();
//    private SharedPreferences preferences =context.getSharedPreferences(WXL_LOCAL_STORAGE_DATA, context.MODE_PRIVATE);
//    SharedPreferences.Editor editor = preferences.edit();
    //获取加密类
    RSAEncrypt rsaEncrypt= new RSAEncrypt();
    //token操作对象
//    TokenOption tokenOption = new TokenOption(context,WXL_LOCAL_STORAGE_DATA);
    //工具对象
    Utils utils = new Utils();
    AESEncrypt aesEncrypt = new AESEncrypt();

    private String keyToken = "";
    private String BowerToken = "";

    @Override
    public boolean execute(String action, JSONArray args, CallbackContext callbackContext) throws JSONException {

        // args [username,password,time]
        if (action.equals("getLoginSign")) {
            String username = args.getString(0);
            String password = args.getString(1);
            String time = args.getString(2);
            this.getLoginSign(username,password,time, callbackContext);
            return true;
        }
        if (action.equals("getSign")) {
            String version = args.getString(0);
            String time = args.getString(1);
            String token = args.getString(2);
            this.getSign(version ,time,token, callbackContext);
            return true;
        }

        return false;
    }

    //登录生成sign
    private void getLoginSign(String username,String password,String time,CallbackContext callbackContext){
        String sign = "";
        String encryptStr = "";
        encryptStr+=username+',';
        encryptStr+=password+',';
        encryptStr+=time;
        //公钥对username,password,time进行加密
        try {
            byte[] cipher = rsaEncrypt.encrypt(rsaEncrypt.getPublicKey(), encryptStr.getBytes());
            //转换为base64的hexString
            sign = RSAEncrypt.byteArrayToString(cipher);
        } catch (Exception e) {
            System.err.println(e.getMessage());
        }
        if(sign.length() > 0){
            callbackContext.success(utils.setSuccess(sign));
        }else {
            callbackContext.error(utils.setError("生成sign失败.."));
        }
    }

    //得到请求的sign
    private void getSign(String version,String time,String token,CallbackContext callbackContext){
        System.err.println("tokentest:"+token);
        if(token.length()<1){
            callbackContext.success(utils.setSuccess("0"));
            return;
        }
        if(this.BowerToken != token){
            this.setKeyToken(token);
        }
        String sign = "";
        String encryptStr = "";
        encryptStr+=version+',';
        encryptStr+=this.keyToken+',';
        encryptStr+=time;
        try {
            sign = aesEncrypt.encrypt(encryptStr);
            callbackContext.success(utils.setSuccess(sign));
        }catch (Exception e){
            e.printStackTrace();
            callbackContext.error(utils.setError("加密失败.."));
        }


    }



    private void setKeyToken(String s){
        byte[] ciphers = RSAEncrypt.toBytes(s);
        byte[] plainText;
        String token;
        try {
            plainText = rsaEncrypt.decrypt(rsaEncrypt.getPrivateKey(), ciphers);
            token = new String(plainText);
            this.BowerToken = s;
            this.keyToken = token;
        } catch (Exception e) {
            System.err.println(e.getMessage());
        }

    }


}
