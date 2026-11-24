import javax.microedition.lcdui.Graphics;
import javax.microedition.lcdui.Image;

public final class h {
   public Image a;
   private boolean a = false;
   private int d;
   private int e;
   public int a;
   public int b;
   private int f;
   private int g;
   public int c = 0;

   public h(h var1, int var2, int var3, int var4, int var5) {
      this.a = var1.a;
      this.a = var4;
      this.b = var5;
      this.d = var2 * var4 + var1.d;
      this.e = var3 * var5 + var1.e;
      this.a = true;
   }

   public h(h var1, int var2) {
      this.a = var1.a;
      this.a = var1.a;
      this.b = var1.b;
      this.d = var1.d;
      this.e = var1.e;
      this.f = var1.f;
      this.g = var1.g;
      this.a = var1.a;
      if ((var2 & 1) != 0) {
         this.c = 2;
      } else if ((var2 & 2) != 0) {
         this.c = 1;
      } else if ((var2 & 4) != 0) {
         this.c = 6;
      } else if ((var2 & 8) != 0) {
         this.c = 3;
      } else {
         if ((var2 & 16) != 0) {
            this.c = 5;
         }
      }
   }

   public h(String var1) throws Exception {
      byte[] var2 = e.a(var1 + ".png");
      this.a = Image.createImage(var2, 0, var2.length);
      this.a = (short)this.a.getWidth();
      this.b = (short)this.a.getHeight();
      this.a = false;
   }

   public final void a(int var1, int var2, int var3) {
      if (!this.a) {
         int var4 = var1 & 13;
         int var5 = var1 & 50;
         if (this.c == 2) {
            if ((var4 & 4) != 0) {
               var4 = 8;
            } else if ((var4 & 8) != 0) {
               var4 = 4;
            }
         } else if (this.c == 1) {
            if ((var5 & 16) != 0) {
               var4 = 32;
            } else if ((var4 & 32) != 0) {
               var4 = 16;
            }
         }

         if (((var1 = var4 | var5) & 8) != 0) {
            this.f = var2 - this.a;
         } else if ((var1 & 1) != 0) {
            this.f = var2 - this.a >> 1;
         }

         if ((var1 & 32) != 0) {
            this.g = var3 - this.b;
         } else {
            if ((var1 & 2) != 0) {
               this.g = var3 - this.b >> 1;
            }
         }
      }
   }

   public final void a(int var1, int var2) {
      this.f += var1;
      this.g += var2;
   }

   public final void a(Graphics var1, int var2, int var3) {
      this.a(var1, var2, var3, 20);
   }

   public final void a(Graphics var1, int var2, int var3, int var4) {
      if (!this.a && this.c == 0) {
         var1.drawImage(this.a, var2 + this.f, var3 + this.g, var4);
      } else {
         var1.drawRegion(this.a, this.d, this.e, this.a, this.b, this.c, var2 + this.f, var3 + this.g, var4);
      }
   }

   public h(String var1, int var2) {
      byte[] var3 = e.a(var1 + ".png");
      if (var2 != 1) {
         byte[] var4 = new byte[var3.length];
         System.arraycopy(var3, 0, var4, 0, var3.length);
         a(var4, var2);
         var3 = var4;
      }

      this.a = Image.createImage(var3, 0, var3.length);
      this.a = (short)this.a.getWidth();
      this.b = (short)this.a.getHeight();
   }

   public static final void a(byte[] var0, int var1) {
      try {
         int var2 = 33;
         int var3 = 0;

         for (int var4 = var0.length - 3; var3 < var4; var3++) {
            if (var0[var3] == 80 && var0[var3 + 1] == 76 && var0[var3 + 2] == 84) {
               var2 = var3 - 4;
               break;
            }
         }

         var3 = var2;
         int var20 = ((var0[var3] & 255) << 24 | (var0[var3 + 1] & 255) << 16 | (var0[var3 + 2] & 255) << 8 | var0[var3 + 3] & 255) & -1;
         var3 += 4;
         int var5 = -1;

         for (int var6 = 0; var6 < 4; var6++) {
            var5 = a(var0[var3 + var6], var5);
         }

         var3 += 4;
         boolean var7 = false;
         boolean var8 = false;

         for (int var9 = var3; var9 < var3 + var20; var9 += 3) {
            int var10 = var0[var9] & 255;
            int var11 = var0[var9 + 1] & 255;
            int var12 = var0[var9 + 2] & 255;
            if (var1 == 0) {
               if (var10 != 244 || var11 != 244 || var12 != 230) {
                  int var28;
                  var10 = var28 = (var10 + var11 + var12) / 3;
                  var11 = var28;
                  var12 = var28;
                  var0[var9] = (byte)var10;
                  var0[var9 + 1] = (byte)var11;
                  var0[var9 + 2] = (byte)var12;
               }
            } else if (var1 != 1) {
               int[][] var13 = i.a[1];
               int[][] var14 = i.a[var1];

               for (int var15 = 0; var15 < var13.length; var15++) {
                  if (var13[var15][0] == var10 && var13[var15][1] == var11 && var13[var15][2] == var12) {
                     var0[var9] = (byte)var14[var15][0];
                     var0[var9 + 1] = (byte)var14[var15][1];
                     var0[var9 + 2] = (byte)var14[var15][2];
                     break;
                  }
               }
            }

            var5 = a(var0[var9], var5);
            var5 = a(var0[var9 + 1], var5);
            var5 = a(var0[var9 + 2], var5);
         }

         var5 = ~var5;
         int var24 = var2 + 8 + var20;
         var0[var24] = (byte)(var5 >> 24);
         var0[var24 + 1] = (byte)(var5 >> 16);
         var0[var24 + 2] = (byte)(var5 >> 8);
         var0[var24 + 3] = (byte)var5;
      } catch (Exception var16) {
         var16.printStackTrace();
      }
   }

   public static final int a(byte var0, int var1) {
      int var2 = var0 & 255;
      var1 ^= var2;

      for (int var3 = 0; var3 < 8; var3++) {
         if ((var1 & 1) != 0) {
            var1 = var1 >>> 1 ^ -306674912;
         } else {
            var1 >>>= 1;
         }
      }

      return var1;
   }
}
