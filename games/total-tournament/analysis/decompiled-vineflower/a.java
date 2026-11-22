import javax.microedition.lcdui.Graphics;
import javax.microedition.lcdui.Image;

public final class a {
   private int[][] a;
   private Image b;
   private int c;
   private int d;
   private int e;
   private String f = "";

   public a() {
      this.e = 127;
      this.c = 1;
      this.d = 1;
      if (this.a == null) {
         this.b();
      }

      if (this.b == null) {
         this = this;

         try {
            this.b = b.a("/fnt.png");
            return;
         } catch (Exception var1) {
         }
      }
   }

   public final int a(char var1) {
      int var2 = this.c + this.a[2][this.a((int)var1)];
      if (var1 == '\n' || var1 == '\r') {
         var2 = 0;
      }

      return var2;
   }

   private final void b() {
      byte[] var4 = b.d.a("cf" + this.f, -1);
      this.e = var4.length / 6;
      this.a = new int[6][this.e + 2];
      int var3 = 0;

      for (int var2 = 0; var2 < this.e; var2++) {
         for (int var1 = 0; var1 < 6; var1++) {
            this.a[var1][var2] = var4[var3];
            var3++;
         }
      }
   }

   public final void a(Graphics var1, String var2, int var3, int var4, int var5) {
      this.a(var1, var2, 0, var2.length(), var3, var4, 20);
   }

   public final void a(Graphics var1, String var2, int var3, int var4, int var5, int var6, int var7) {
      var3 = var5;
      var5 = var6 + this.a() - this.d;
      int var11 = var4;
      int var10 = 0;
      int var9 = var7;
      String var8 = var2;
      a var24 = this;
      int[] var12 = new int[2];
      int var13 = var24.a();
      int var14 = var24.a(var8, var10, var11);
      if ((var9 & 32) > 0) {
         var12[1] -= var13;
      }

      if ((var9 & 2) > 0) {
         var12[1] -= var13 >> 1;
      }

      if ((var9 & 8) > 0) {
         var12[0] -= var14;
      }

      if ((var9 & 1) > 0) {
         var12[0] -= var14 >> 1;
      }

      int[] var22 = var12;
      var3 += var22[0];
      var5 += var22[1];

      for (int var23 = 0; var23 < var4 + 0; var23++) {
         char var10003 = var2.charAt(var23);
         var11 = var5;
         var10 = var3;
         char var27 = var10003;
         Graphics var26 = var1;
         a var25 = this;
         int var30 = var26.getClipX();
         var13 = var26.getClipY();
         var14 = var26.getClipWidth();
         var3 = var26.getClipHeight();
         int var15 = var25.a((int)var27);
         int var16 = var25.a[3][var15];
         var26.setClip(var10 + var25.a[4][var15], var11 - var25.a[5][var15] - var16, var25.a[2][var15], var25.a[3][var15]);
         var26.drawImage(var25.b, var10 - var25.a[0][var15] + var25.a[4][var15], var11 - var25.a[1][var15] - var25.a[5][var15] - var16, 20);
         var26.setClip(var30, var13, var14, var3);
         var3 += var25.a(var27);
      }
   }

   public final int a() {
      return this.d + this.a[3][this.a(1062)];
   }

   private int a(int var1) {
      if ((var1 = var1) >= 65408) {
         var1 -= 65280;
      }

      if (var1 > 848) {
         var1 -= 848;
      }

      if (var1 == 168) {
         var1 = 197;
      }

      if (var1 == 184) {
         var1 = 229;
      }

      if (var1 >= 97 && var1 <= 122) {
         var1 -= 32;
      } else if (var1 >= 192 && var1 <= 223) {
         var1 -= 96;
      } else if (var1 >= 224 && var1 <= 255) {
         var1 -= 128;
      } else if (var1 >= 154 && var1 <= 191) {
         var1 -= 26;
      }

      var1 -= 32;
      if (var1 < 0 || var1 >= this.e) {
         var1 = 0;
      }

      return var1;
   }

   public final int a(String var1) {
      int var2 = 0;
      int var3 = var1.length();

      for (int var4 = 0; var4 < var3; var4++) {
         var2 += this.a(var1.charAt(var4));
      }

      return var2;
   }

   public final int a(String var1, int var2, int var3) {
      int var4 = 0;

      for (int var5 = 0; var5 < var3; var5++) {
         var4 += this.a(var1.charAt(var5 + var2));
      }

      return var4;
   }
}
