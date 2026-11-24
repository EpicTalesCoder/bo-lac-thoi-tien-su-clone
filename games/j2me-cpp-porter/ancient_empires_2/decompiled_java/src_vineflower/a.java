import java.io.DataInputStream;
import java.io.InputStream;
import java.util.Vector;
import javax.microedition.lcdui.Font;
import javax.microedition.lcdui.Graphics;

public class a {
   public static e a;
   public int W;
   public int X;
   public int Y;
   public int Z;
   public static String[] c;
   public static short[] b = null;
   public static int aa = 360;
   public static int ab = 0;
   public static int ac = 0;

   public a() {
      this.W = a.getWidth();
      this.X = a.getHeight();
      this.Y = this.W >> 1;
      this.Z = this.X >> 1;
   }

   public void a() {
   }

   public void a(int var1, int var2) {
   }

   public void c() throws Exception {
   }

   public void a(Graphics var1) {
   }

   public static final String[] a(String var0, int var1, Font var2) {
      Vector var3 = new Vector();
      int var4 = 0;
      boolean var5 = false;
      int var6 = var0.length();
      String var7 = null;

      int var9;
      do {
         var9 = var4;
         int var10 = var0.indexOf(10, var9);

         label40:
         do {
            int var11 = var9;
            String var8 = var7;
            var9 = a(var0, var9);
            if (var10 > -1 && var10 < var9) {
               var9 = var10;
            }

            var7 = var0.substring(var4, var9).trim();
            if (var2.stringWidth(var7) > var1) {
               if (var11 == var4) {
                  for (int var12 = var7.length() - 1; var12 > 0; var12--) {
                     String var13 = var7.substring(0, var12);
                     if (var2.stringWidth(var13) <= var1) {
                        var9 = var11 + var12;
                        var7 = var13;
                        break label40;
                     }
                  }
                  break;
               }

               var9 = var11;
               var7 = var8;
               break;
            }

            if (var9 == var10) {
               var9++;
               break;
            }
         } while (var9 < var6);

         var3.addElement(var7);
         var4 = var9;
      } while (var9 < var6);

      String[] var14 = new String[var3.size()];
      var3.copyInto(var14);
      return var14;
   }

   private static final int a(String var0, int var1) {
      if (a(var0.charAt(var1))) {
         return var1 + 1;
      }

      int var3 = 0;

      int var4;
      while ((var4 = var0.indexOf(32, var1)) == 0) {
         var1++;
      }

      var3 = var4;
      if (var4 == -1) {
         var3 = var0.length();
      } else {
         var3++;
      }

      for (int var7 = var1 + 1; var7 < var3; var7++) {
         if (a(var0.charAt(var7))) {
            return var7;
         }
      }

      return var3;
   }

   private static final boolean a(int var0) {
      return var0 >= 11904 && var0 < 44032 || var0 >= 63744 && var0 < 64256 || var0 >= 65280 && var0 < 65504;
   }

   public static final int a(String var0, boolean var1) throws Exception {
      InputStream var2 = b.a.getClass().getResourceAsStream(var0);
      DataInputStream var3;
      c = new String[(var3 = new DataInputStream(var2)).readInt()];
      int var4 = 0;

      for (int var5 = c.length; var4 < var5; var4++) {
         String var6 = var3.readUTF();
         c[var4] = var6;
      }

      var3.close();
      return c.length;
   }

   public static final String a(int var0) {
      return a(var0, false);
   }

   public static final String a(int var0, boolean var1) {
      if (var0 < c.length) {
         String var2 = c[var0];
         if (var1
            && (var2 = a(a(a(a(var2, "%K5", a(20, a.a(16)), true), "%K0", a.a(32), true), "%K7", a.a(256), true), "%K9", a.a(512), true)).indexOf("%KM") != -1) {
            StringBuffer var3 = new StringBuffer();
            String[] var4 = new String[]{a.a(1), a.a(2), a.a(4), a.a(8)};
            var3.append(a(17, var4));
            if (var3.length() > 0) {
               var3.append('/');
            }

            var3.append(a(18));
            var2 = a(var2, "%KM", var3.toString(), true);
         }

         return var2;
      } else {
         return "?: " + var0;
      }
   }

   public static final String a(int var0, String[] var1) {
      String var2 = new String(a(var0));

      for (int var3 = 0; var3 < var1.length; var3++) {
         var2 = a(var2, "%U", var1[var3], false);
      }

      return var2;
   }

   public static final String a(int var0, String var1) {
      return a(a(var0), "%U", var1, false);
   }

   public static final String a(String var0, String var1, String var2, boolean var3) {
      String var4 = var0;

      int var5;
      while ((var5 = var4.indexOf(var1)) != -1) {
         var4 = var4.substring(0, var5) + var2 + var4.substring(var5 + var1.length());
         if (!var3) {
            break;
         }
      }

      return var4;
   }

   public static final void d() {
      boolean var0 = false;
      ab = aa >> 1;
      ac = ab >> 1;
      b = new short[aa];
      int var1 = aa * 10000 / 2 / 31415;
      int var2 = 1024 * var1;
      int var3 = 0;

      for (int var5 = 0; var5 < aa; var5++) {
         int var4 = var3 / var1;
         b[var5] = (short)var4;
         var2 -= var4;
         var3 += var2 / var1;
      }

      b[180] = 0;
      b[270] = -1024;
   }

   public static final short a(int var0) {
      var0 %= 360;
      return b[var0];
   }

   public static final short b(int var0) {
      var0 = (var0 + ac) % 360;
      return b[var0];
   }
}
