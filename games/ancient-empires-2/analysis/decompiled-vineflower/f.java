import java.io.InputStream;
import javax.microedition.lcdui.Graphics;

public class f {
   public h[] a;
   private byte[] f;
   public int m = 0;
   public int n = 0;
   public int o = 0;
   public boolean c = true;
   public int p;
   public int q;
   public byte[][] c;
   public int r;
   public byte k = 0;
   public int s = -1;
   public int t;
   public int u;
   public int v;
   public int w;
   public int x;
   public boolean d = true;
   public boolean e;
   public boolean f;
   public int y = -1;
   public byte l = -1;
   public boolean g;
   public int z;
   public String b;
   public int A;
   public f a;
   public f b;
   public int[][] a;
   public short[][] a;
   public int B = 16769024;
   public byte[] e;
   public boolean[] a;

   public f(String var1) throws Exception {
      this.a(var1, 1);
   }

   public f(h[] var1) {
      this.a = var1;
      this.f = new byte[this.a.length];
      byte var2 = 0;

      while (var2 < this.a.length) {
         this.f[var2] = var2++;
      }

      this.p = this.a[0].a;
      this.q = this.a[0].b;
   }

   public f(String var1, byte var2) throws Exception {
      this.a(var1, var2);
   }

   private final void a(String var1, int var2) throws Exception {
      InputStream var3;
      byte var4 = (byte)(var3 = e.a(var1 + ".sprite")).read();
      this.p = (byte)var3.read();
      this.q = (byte)var3.read();
      this.a = new h[var4];
      h[] var5 = new h[var4];

      try {
         h var6;
         int var16 = (var6 = new h(var1, var2)).a / this.p;
         int var20 = var6.b / this.q;
         int var9 = 0;

         for (int var10 = 0; var10 < var20; var10++) {
            for (int var11 = 0; var11 < var16; var11++) {
               var5[var9] = new h(var6, var11, var10, this.p, this.q);
               var9++;
            }
         }
      } catch (Exception var13) {
         try {
            for (int var7 = 0; var7 < var4; var7++) {
               StringBuffer var8;
               (var8 = new StringBuffer(var1)).append('_');
               if (var7 < 10) {
                  var8.append('0');
               }

               var8.append(var7);
               if (var2 == 1) {
                  var5[var7] = new h(var8.toString());
               } else {
                  var5[var7] = new h(var8.toString(), var2);
               }
            }
         } catch (Exception var12) {
         }
      }

      for (int var14 = 0; var14 < var4; var14++) {
         int var17 = var3.read();
         int var21 = var3.read();
         this.a[var14] = new h(var5[var17], var21);
      }

      int var15;
      if ((var15 = var3.read()) > 0) {
         for (int var18 = 0; var18 < var4; var18++) {
            this.a[var18].a(var15, this.p, this.q);
         }
      }

      int var19;
      if ((var19 = var3.read()) > 0) {
         this.c = new byte[var19][];
         this.u = var3.read() * 50;

         for (int var22 = 0; var22 < var19; var22++) {
            int var25 = var3.read();
            this.c[var22] = new byte[var25];

            for (int var27 = 0; var27 < var25; var27++) {
               this.c[var22][var27] = (byte)var3.read();
            }
         }
      }

      for (int var23 = 0; var23 < var4; var23++) {
         byte var26 = (byte)var3.read();
         byte var28 = (byte)var3.read();
         if (var26 == -1 || var28 == -1) {
            break;
         }

         this.a[var23].a(var26, var28);
      }

      var3.close();
      if (this.c != null) {
         this.f = this.c[0];
      } else {
         this.f = new byte[var4];
         byte var24 = 0;

         while (var24 < var4) {
            this.f[var24] = var24++;
         }
      }
   }

   public f(f var1) {
      this.a = var1.a;
      this.f = var1.f;
      this.m = var1.m;
      this.n = var1.n;
      this.o = var1.o;
      this.r = var1.r;
      this.c = var1.c;
      this.p = var1.p;
      this.q = var1.q;
      this.u = var1.u;
      this.c = var1.c;
   }

   public f(int var1, int var2) {
      this.p = var1;
      this.q = var2;
   }

   public final int d() {
      return this.f.length;
   }

   public final int e() {
      return this.a.length;
   }

   public final void c(int var1) {
      if (var1 < this.f.length) {
         this.m = (byte)var1;
      }
   }

   public final void b(int var1, int var2) {
      this.n = (short)var1;
      this.o = (short)var2;
   }

   public final void e() {
      this.m++;
      if (this.m >= this.f.length) {
         this.m = 0;
      }
   }

   public final void a(byte[] var1) {
      this.f = var1;
      this.m = 0;
      this.t = 0;
   }

   public final void a(int var1, boolean var2) {
      if (this.c != null && var1 <= this.c.length) {
         byte[] var3 = this.c[var1];
         if (var2) {
            byte[] var4 = new byte[var3.length];

            for (int var5 = 0; var5 < var4.length; var5++) {
               var4[var5] = (byte)(var3[var5] + this.e() / 2);
            }

            var3 = var4;
         }

         this.a(var3);
      }
   }

   public final void a(Graphics var1, int var2, int var3, int var4, int var5) {
      if (this.k != 2 && this.k != 4 && this.k != 3) {
         if (this.c) {
            int var6 = this.n + var3;
            int var7 = this.o + var4;
            this.a[var2].a(var1, var6, var7, var5);
         }
      } else {
         this.a(var1, var3, var4);
      }
   }

   public final void a(Graphics var1, int var2, int var3, int var4) {
      this.a(var1, this.f[this.m], var2, var3, var4);
   }

   public void a(Graphics var1, int var2, int var3) {
      if (this.k != 2 && this.k != 4) {
         if (this.k == 6) {
            boolean var10 = false;
            if (this.m == 0) {
               var1.setColor(15718144);
            } else {
               var1.setColor(16777215);
            }

            if (this.v > 0) {
               int var12 = this.n + 15;
               var1.fillArc(this.n, this.o - 15, 30, 30, 0, 360);
               var1.fillRect(var12, this.o - 15, e.e - var12, 30);
               return;
            }

            var1.fillArc(this.n - 30, this.o - 15, 30, 30, 0, 360);
            var1.fillRect(0, this.o - 15, this.n - 15, 30);
            return;
         }

         if (this.k == 3) {
            var1.setColor(0);
            if (this.v > 0) {
               var1.drawLine(this.n, this.o, this.n + 4, this.o - 2);
               return;
            }

            var1.drawLine(this.n - 4, this.o - 2, this.n, this.o);
            return;
         }

         if (this.c) {
            int var9 = this.n + var2;
            int var11 = this.o + var3;
            if (this.b != null) {
               e.a(var1, this.b, var9, var11, this.A, 33);
               return;
            }

            if (this.y > 0) {
               var9 += e.a(-4, 5);
               var11 += e.a(-1, 2);
            }

            byte var13 = this.f[this.m];
            this.a[var13].a(var1, var9, var11);
            if (this.a != null) {
               int var7;
               f var8;
               if ((var7 = var13 % (this.e() / 2)) == 2) {
                  var8 = this.b;
               } else {
                  var8 = this.a;
                  this.a.c(var7);
               }

               var8.a(var1, var9, var11);
            }
         }
      } else {
         var1.setColor(this.B);

         for (int var6 = 0; var6 < 5; var6++) {
            if (this.a[var6]) {
               int var4 = (this.a[var6][0] >> 10) + var2 + this.n;
               int var5 = (this.a[var6][1] >> 10) + var3 + this.o;
               var1.fillRect(var4, var5, this.e[var6], this.e[var6]);
            }
         }
      }
   }

   public static final f a(String var0, int var1, int var2, byte var3) {
      int var4 = e.a(var3, var0);
      int var5 = e.a(var3);
      f var6;
      (var6 = new f(var4, var5)).A = var3;
      var6.b = var0;
      var6.v = var1;
      var6.x = var2;
      var6.k = 5;
      return var6;
   }

   public static final f a(f var0, int var1, int var2, int var3, int var4, int var5, byte var6) {
      f var7 = null;
      if (var0 != null) {
         var7 = new f(var0);
      } else {
         var7 = new f(0, 0);
         if (var6 == 2 || var6 == 4) {
            if (var6 == 4) {
               var7.B = 15658751;
            }

            var7.a = new int[5][2];
            var7.a = new short[5][2];
            var7.e = new byte[5];
            var7.a = new boolean[5];
            boolean var8 = false;
            boolean var9 = false;

            for (int var10 = 0; var10 < 5; var10++) {
               var7.a[var10] = true;
               if (var6 == 4) {
                  var7.a[var10][0] = (short)(e.a.nextInt() % 4 << 10);
                  var7.a[var10][1] = (short)(e.a.nextInt() % 4 << 10);
               } else {
                  var7.a[var10][0] = (short)(Math.abs(e.a.nextInt()) % 8192 + -4096);
                  var7.a[var10][1] = (short)(Math.abs(e.a.nextInt()) % 4096 + -2048);
               }

               var7.e[var10] = (byte)(Math.abs(e.a.nextInt()) % 2 + 1);
            }
         }
      }

      var7.k = var6;
      var7.s = var4;
      var7.u = var5;
      var7.v = var1;
      var7.w = var2;
      var7.x = var3;
      var7.e = true;
      return var7;
   }

   public void c() {
      if (this.d) {
         this.t += 50;
         if (this.y >= 0) {
            this.y--;
         }

         switch (this.k) {
            case 2:
            case 4:
               this.f();
               return;
            case 3:
               this.b(this.n + this.v, this.o + this.w);
               return;
            case 5:
               if (this.s == -1) {
                  this.b(this.n + this.v, this.o);
                  this.r = this.r + this.x;
                  if (this.r < 0) {
                     this.x++;
                     return;
                  }

                  this.r = 0;
                  this.x = -this.x / 2;
                  if (this.x == 0) {
                     this.s = 1;
                     this.t = 0;
                     return;
                  }
               } else if (this.t >= 400) {
                  this.d = false;
                  return;
               }
               break;
            case 6:
               this.m = (this.m + 1) % 2;
               if (this.t >= this.u) {
                  this.d = false;
                  return;
               }
               break;
            default:
               this.b(this.n + this.v, this.o + this.w);
               this.r = this.r + this.x;
               if (this.s != 0 && this.t >= this.u) {
                  this.e();
                  if (this.k == 0 && this.m == 0 && this.s > 0) {
                     this.s--;
                     if (this.s <= 0) {
                        this.c(this.d() - 1);
                        if (this.e) {
                           this.d = false;
                        }
                     }
                  }

                  this.t = 0;
               }
         }
      }
   }

   public final void f() {
      if (this.k != 4) {
         this.B += -263168;
      }

      for (int var1 = 0; var1 < 5; var1++) {
         if (this.a[var1]) {
            if (this.k == 4) {
               this.a[var1][0] = this.a[var1][0] + this.a[var1][0];
               this.a[var1][1] = this.a[var1][1] + this.a[var1][1];
               if (this.a[var1][0] < 0) {
                  this.a[var1][0] = (short)(this.a[var1][0] + 256);
               } else if (this.a[var1][0] > 0) {
                  this.a[var1][0] = (short)(this.a[var1][0] - 256);
               }

               if (this.a[var1][1] < 0) {
                  this.a[var1][1] = (short)(this.a[var1][1] + 256);
               } else if (this.a[var1][1] > 0) {
                  this.a[var1][1] = (short)(this.a[var1][1] - 256);
               }
            } else {
               this.a[var1][0] = this.a[var1][0] + this.a[var1][0];
               this.a[var1][1] = this.a[var1][1] + this.a[var1][1];
               this.a[var1][1] = (short)(this.a[var1][1] + 256);
            }
         }
      }

      if (this.t >= this.u) {
         this.d = false;
      }
   }
}
