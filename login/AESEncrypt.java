package xiao.cordova.list.sign;

import java.security.MessageDigest;

import javax.crypto.Cipher;
import javax.crypto.spec.SecretKeySpec;

/**
 * Created by wangxiaolong on 2018/5/14.
 */

public class AESEncrypt {

    public static final String DEFAULT_CODING = "utf-8";
    public static final String AES_KEY_COMMON = "AES_KEY_COMMON_wxl_cordova_key";

    //解密
    private static String decrypt(String encrypted, String key) throws Exception {

        byte[] keyb = key.getBytes(DEFAULT_CODING);

        //兼容 server node AES，所需要先需要MD5加密下
        MessageDigest md = MessageDigest.getInstance("MD5");
        byte[] thedigest = md.digest(keyb);

        SecretKeySpec skey = new SecretKeySpec(thedigest, "AES");
        Cipher dcipher = Cipher.getInstance("AES");
        dcipher.init(Cipher.DECRYPT_MODE, skey);

        byte[] clearbyte = dcipher.doFinal(toByte(encrypted));
        return new String(clearbyte);
    }
    //加密
    public static String encrypt(String content) throws Exception {
        byte[] input = content.getBytes(DEFAULT_CODING);
        MessageDigest md = MessageDigest.getInstance("MD5");
        byte[] thedigest = md.digest(AES_KEY_COMMON.getBytes(DEFAULT_CODING));
        SecretKeySpec skc = new SecretKeySpec(thedigest, "AES");
        Cipher cipher = Cipher.getInstance("AES/ECB/PKCS5Padding");
        cipher.init(Cipher.ENCRYPT_MODE, skc);

        byte[] cipherText = new byte[cipher.getOutputSize(input.length)];
        int ctLength = cipher.update(input, 0, input.length, cipherText, 0);
        ctLength += cipher.doFinal(cipherText, ctLength);

        return parseByte2HexStr(cipherText);
    }
    //字符串转字节数组
    private static byte[] toByte(String hexString) {
        int len = hexString.length() / 2;
        byte[] result = new byte[len];
        for (int i = 0; i < len; i++) {
            result[i] = Integer.valueOf(hexString.substring(2 * i, 2 * i + 2), 16).byteValue();
        }
        return result;
    }
    //字节数组转16进制字符串
    private static String parseByte2HexStr(byte buf[]) {
        StringBuffer sb = new StringBuffer();
        for (int i = 0; i < buf.length; i++) {
            String hex = Integer.toHexString(buf[i] & 0xFF);
            if (hex.length() == 1) {
                hex = '0' + hex;
            }
            sb.append(hex);
        }
        return sb.toString();
    }

//    public static void main(String[] args){
//        AESEncrypt aesEncrypt= new AESEncrypt();
//        //测试字符串
//        String encryptStr= "xiaolong,123456,time";
//        try {
//            //加密
//            String info = aesEncrypt.encrypt("xiaolong_1234");
//            System.out.println("解密:"+ info);
//        } catch (Exception e) {
//            System.err.println(e.getMessage());
//        }
//    }

}
