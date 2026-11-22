import java.io.DataInputStream;
import java.io.InputStream;
import javax.microedition.lcdui.Image;
import javax.microedition.rms.RecordStore;

public final class b {
   static byte[] a = new byte[b.e];
   private static int e = e.x;
   static boolean b = true;
   static boolean c = false;
   private static String f = e.M;
   public static b d;

   static final Image a(String var0) {
      byte[] var7 = d.a(var0, -1);

      try {
         return Image.createImage(var7, 0, var7.length);
      } catch (Exception var6) {
         try {
            return Image.createImage(a(var7, 100), 0, var7.length);
         } catch (Exception var5) {
            a(var7, 100);
            int var2 = var7[2] - 3;
            byte[] var1 = var7;
            int var3 = var7.length;
            byte var4 = (byte)var2;

            for (int var8 = 0; var8 < var3; var8++) {
               var1[var8] ^= var4;
               var4++;
            }

            return Image.createImage(var1, 3, var7.length - 3);
         }
      }
   }

   private static byte[] a(String var0, byte[] var1) {
      boolean var2 = false;

      try {
         RecordStore var3;
         if ((var3 = RecordStore.openRecordStore(var0, true)).getNumRecords() == 1) {
            var3.getRecord(1, var1, 0);
            var2 = true;
         }

         var3.closeRecordStore();
      } catch (Exception var4) {
      }

      if (!var2) {
         e.ac = true;
         e.v = 0;
         e.n = e.o;
         e.P = 0;
         var1 = a(var1);
         b(var0, var1);
      }

      return var1;
   }

   private static final void b(String var0, byte[] var1) {
      try {
         RecordStore var2;
         if ((var2 = RecordStore.openRecordStore(var0, true)).getNumRecords() == 1) {
            var2.closeRecordStore();
            if (RecordStore.listRecordStores() != null) {
               RecordStore.deleteRecordStore(var0);
            }

            var2 = RecordStore.openRecordStore(var0, true);
         }

         var2.addRecord(var1, 0, var1.length);
         var2.closeRecordStore();
      } catch (Exception var3) {
      }
   }

   private static byte[] a(byte[] var0, int var1) {
      int var2 = var0.length;

      for (int var3 = 0; var3 < var2; var3++) {
         var0[var3] = (byte)(var0[var3] ^ var1);
         if (++var1 > 255) {
            var1 = 0;
         }
      }

      return var0;
   }

   private static String d(String var0) {
      try {
         if (var0.length() > 0) {
            if (var0.charAt(0) != '/') {
               var0 = "/" + var0;
            }
         } else {
            var0 = "/" + var0;
         }

         if (var0.length() > 3) {
            if (var0.charAt(var0.length() - 4) != '.') {
               var0 = var0 + ".png";
            }
         } else {
            var0 = var0 + ".png";
         }
      } catch (Exception var1) {
      }

      return var0;
   }

   static final void a() {
      if (b) {
         a = a(f, a);
      }

      b = false;
      byte[] var0 = a;
      e.ac = true;
      if (a[2] < 1) {
         e.ac = false;
      }

      e.v = var0[3];
      if ((e.n = var0[5]) > e.o) {
         e.n = e.o;
      }

      e.P = e.a(var0[6], var0[7]);
      a = var0;
   }

   static final void b() {
      a = a(a);
      if (c) {
         b(f, a);
      }

      c = false;
   }

   private int e(String var1) {
      var1 = d(var1);
      int var2 = 0;
      int var3 = -1;

      try {
         InputStream var5;
         if ((var5 = this.getClass().getResourceAsStream(var1)) == null) {
            return -1;
         }

         while (var2 != -1) {
            var2 = var5.read();
            var3++;
         }

         var5.close();
      } catch (Exception var4) {
         var3 = -1;
      }

      return var3;
   }

   public final String[][] b(String var1) {
      var1 = var1;
      String var10;
      int var13;
      String[][] var2 = new String[var13 = (var10 = this.a(var1, ' ')).length()][];
      int var3 = 0;
      int var4 = var13;
      var2[0] = new String[var4];
      int var5 = 0;
      int var6 = 0;
      int var7 = 0;
      char var8 = '\u0000';
      char var9 = '\u0000';

      for (var5 = 0; var5 < var13; var5++) {
         if ((var8 = var10.charAt(var5)) == '=' || var8 == '\r' || var8 == '\n') {
            var2[var3][var7] = var10.substring(var6, var5);
            var6 = ++var5;
            var7++;
         }

         if (var8 == '\r' || var8 == '\n') {
            if (((var9 = var10.charAt(var5)) == '\n' || var9 == '\r') && var9 != var8) {
               var6 = ++var5;
            }

            var7 = 0;
            var2[++var3] = new String[var4];
         }
      }

      if (var5 > var6 && var6 < var13) {
         var2[var3][var7] = var10.substring(var6, var13);
         var3++;
      }

      String[][] var11 = new String[var3][];

      for (int var14 = 0; var14 < var3; var14++) {
         var5 = 0;

         while (var5 < var4 && var2[var14][var5] != null) {
            var5++;
         }

         var11[var14] = new String[var5];
         System.arraycopy(var2[var14], 0, var11[var14], 0, var5);
      }

      return var11;
   }

   protected final byte[] a(String var1, int var2) {
      if (var2 < 0) {
         var2 = this.e(var1);
      }

      var1 = d(var1);
      if (var2 <= 0) {
         return null;
      }

      try {
         Class.forName("com.nokia.mid.ui.FullCanvas");
         return this.b(var1, var2);
      } catch (Exception var4) {
         byte[] var7 = new byte[var2];

         try {
            InputStream var5;
            (var5 = this.getClass().getResourceAsStream(var1)).read(var7);
            var5.close();
         } catch (Exception var3) {
         }

         return var7;
      }
   }

   protected final byte[] a(String var1, int var2, int var3) {
      byte[] var4 = this.a(var1, var2);
      byte var6 = (byte)var3;

      for (int var5 = 0; var5 < var2; var5++) {
         var4[var5] ^= var6;
         var6++;
      }

      return var4;
   }

   private final byte[] b(String var1, int var2) {
      byte[] var9 = new byte[var2];

      try {
         InputStream var5;
         if ((var5 = this.getClass().getResourceAsStream(var1)) == null) {
            return var9;
         }

         DataInputStream var6 = new DataInputStream(var5);
         boolean var7 = false;
         int var3 = 0;

         do {
            var8 = var6.read(var9, var3, var9.length - var3);
            var3 += var8;
         } while (var8 != -1 && var3 < var9.length);

         var6.close();
      } catch (Exception var4) {
      }

      return var9;
   }

   private String a(String var1, char var2) {
      var2 = this.e(var1);
      String var3 = "";
      byte[] var10 = this.a(var1, var2);
      byte var11 = 0;
      if (var10[0] == 95) {
         var11 = 2;
      }

      int var4 = var11;
      int var5 = 0;
      int var6;
      var5 = (var6 = var10.length - var11) + var11;

      for (int var7 = var11; var7 < var5; var7++) {
         if (var10[var7] == 0) {
            var6 = var7 - var11;
            var2 = var7;
            break;
         }
      }

      char[] var17 = new char[var6];

      for (int var8 = 0; var8 < var6; var8++) {
         short var14;
         if ((var14 = var10[var8 + var11]) < 0) {
            var14 += 256;
         }

         var17[var8] = (char)var14;
      }

      for (; var4 < var2; var4++) {
         short var15;
         if ((var15 = var10[var4]) < 0) {
            var15 += 256;
         }

         if (var15 == 0) {
            break;
         }

         if (var15 == 32) {
            var17[var4 - var11] = ' ';
         }

         if (var15 < 10) {
            var17[var4 - var11] = ' ';
         }

         if (var15 >= 192 && var15 <= 255) {
            var15 += 848;
            var17[var4 - var11] = (char)var15;
         }
      }

      try {
         var3 = new String(var17);
      } catch (Exception var9) {
      }

      return var3;
   }

   public final String c(String var1) {
      return this.a(var1, ' ');
   }

   static String[] a(String var0, a var1, int var2, boolean var3) {
      int var4;
      String[] var5 = new String[var4 = var0.length()];
      int var6 = 0;
      int var7 = 0;
      int var8 = 0;
      char var10 = '\u0000';
      int var11 = 0;
      int var12 = 0;
      int var13 = 0;
      int var14 = 1;
      int var15 = 0;
      var6 = (boolean)0;

      for (int var16 = 0; var16 < var4 + 1; var16++) {
         char var9;
         if (var16 >= var4) {
            var9 = '\n';
         } else {
            var9 = var0.charAt(var16);
         }

         var10 = var9;
         var6 = var1.a(var9);
         if (var9 != '\n' && var9 != '\r') {
            var8 += var6;
            var7 += var6;
         }

         switch (var10) {
            case '\n':
            case '\r':
               var14 = var16;
               var8 = var2 + 1;
               var7 = 0;
               if (var16 >= var4) {
                  var15 = var4;
               } else {
                  if (++var16 < var4) {
                     char var22 = var9;
                     if (((var9 = var0.charAt(var16)) == '\n' || var9 == '\r') && var9 != var22) {
                        var16++;
                     }
                  }

                  var15 = var16--;
               }

               var9 = '\n';
               break;
            case ' ':
               var14 = var16 + 1;
               var7 = 0;
         }

         if ((var8 <= var2 || !var3) && var9 != '\n') {
            var11++;
         } else {
            if (var14 == var13 && var11 > 0) {
               var14 = var13 + var11;
            }

            if (var14 > var13) {
               var5[var12] = var0.substring(var13, var14);
            } else {
               var5[var12] = "";
            }

            var13 = var14;
            if (var14 < var15) {
               var13 = var15;
            }

            var14 = var13;
            var8 = var7;
            var7 = 0;
            var11 = 0;
            var12++;
         }
      }

      int var17 = var12;
      String var18 = null;
      var18 = new String[var17];
      System.arraycopy(var5, 0, var18, 0, var17);
      return var18;
   }

   public static final void c() {
      d = null;
   }

   public static final void d() {
      d = new b();
   }

   private static final byte[] a(byte[] var0) {
      if (e.ac) {
         a[2] = 1;
      } else {
         a[2] = 0;
      }

      var0[3] = e.v;
      var0[5] = e.n;
      byte[] var1 = e.b(e.P);
      var0[6] = var1[0];
      var0[7] = var1[1];
      return var0;
   }
}
