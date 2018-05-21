package wxl.cordova.list.getSign;

import com.google.gson.JsonObject;

/**
 * Created by wangxiaolong on 2018/5/14.
 */

public class Utils
{
    private static final Number SUCCESS_STATUS = 1;
    private static final Number ERROR_STATUS = 0;

    public String setSuccess(String s){
        JsonObject obj = new JsonObject();
        obj.addProperty("status",SUCCESS_STATUS);
        obj.addProperty("data",s);
        return obj.toString();
    }

    public String setError(String s){
        JsonObject obj = new JsonObject();
        obj.addProperty("status",ERROR_STATUS);
        obj.addProperty("message",s);
        return obj.toString();
    }


}
