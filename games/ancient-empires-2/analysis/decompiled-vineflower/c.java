import java.io.DataInputStream;
import java.util.Vector;
import javax.microedition.lcdui.Graphics;

public final class c extends f {
   public static byte a = 12;
   public static byte b = 6;
   public static byte c;
   public static i a;
   public String a;
   public short a;
   public int a;
   public byte[][] a;
   public Vector a;
   public short b;
   public long a;
   public byte d;
   public byte e;
   public short c;
   public short d;
   public int b;
   public int c;
   public int d;
   public int e;
   public int f;
   public int g;
   public byte f;
   public byte g;
   public short e;
   public short f;
   public short g;
   public boolean a;
   public boolean b = true;
   public int h;
   public long b;
   public byte h;
   public byte i;
   public int i;
   public c a;
   public byte j = 0;
   public int j;
   public int k;
   public int l;
   public static byte[] a = new byte[12];
   public static byte[][] b = new byte[12][2];
   public static byte[] b = new byte[12];
   public static byte[] c = new byte[12];
   public static byte[] d = new byte[12];
   public static byte[][][] a = new byte[12][][];
   public static short[] a = new short[12];
   public static final short[] b = new short[12];

   private c(byte var1, byte var2, int var3, int var4, boolean var5) {
      super(a.a(var2, var1));
      this.d = var1;
      this.f = 0;
      this.c = (short)var3;
      this.d = (short)var4;
      this.b(var3 * 24, var4 * 24);
      this.a((byte)0);
      if (var5) {
         a.a.addElement(this);
      }
   }

   public final void a(byte var1) {
      this.a = var1;
      int var2 = var1 * 2;
      this.d = b[this.d][0] + var2;
      this.e = b[this.d][1] + var2;
      this.f = b[this.d] + var2;
      if (this.d != 9) {
         int var3;
         if ((var3 = this.a / 2) > 3) {
            var3 = 3;
         }

         this.a = a.a(139 + this.d * 4 + var3);
      }
   }

   public final void a(int var1) {
      this.a = true;
      this.b = a.c;
      this.h = var1;
   }

   public static final c a(byte var0, byte var1, int var2, int var3) {
      return a(var0, var1, var2, var3, true);
   }

   public static final c a(byte var0, byte var1, int var2, int var3, boolean var4) {
      c var5;
      (var5 = new c(var0, a.j[var1], var2, var3, var4)).d = var0;
      var5.e = var1;
      var5.g = 100;
      var5.a = a[var0];
      var5.k = a[var0];
      if (var0 == 9) {
         var5.b(a.j[var1] - 1);
         var5.j = a.e[var1];
         a.a[var1][var5.j] = var5;
         a.e[var1]++;
      }

      return var5;
   }

   public final void a() {
      a.a.removeElement(this);
   }

   public final void b(int var1) {
      this.j = (byte)var1;
      this.a = a.a(var1 + 93);
   }

   public final int a(c var1) {
      return this.a(var1, this.c, this.d);
   }

   public final int a(c var1, int var2, int var3) {
      short var4 = this.f;
      if (var1 != null) {
         if (this.a((short)64) && var1.a((short)1)) {
            var4 += 15;
         }

         if (this.d == 4 && var1.d == 10) {
            var4 += 15;
         }
      }

      if (this.a((short)2) && a.a(var2, var3) == 5) {
         var4 += 10;
      }

      if (a.b[var2][var3] == 34) {
         var4 += 25;
      }

      return var4;
   }

   public final int b(c var1) {
      return this.b(var1, this.c, this.d);
   }

   public final int b(c var1, int var2, int var3) {
      byte var4 = a.a(var2, var3);
      int var5 = this.g + i.f[var4];
      if (this.a((short)2) && var4 == 5) {
         var5 += 15;
      }

      if (a.b[var2][var3] == 34) {
         var5 += 15;
      }

      return var5;
   }

   public final int c(c var1) {
      int var2 = e.a(this.d, this.e) + this.a(var1);
      int var3 = var1.f + var1.b(this);
      int var4;
      if ((var4 = (var2 - var3) * this.g / 100) < 0) {
         var4 = 0;
      } else if (var4 > var1.g) {
         var4 = var1.g;
      }

      var1.g -= var4;
      this.a = this.a + var1.a() * var4;
      return var4;
   }

   public final int a() {
      return this.d + this.e + this.f;
   }

   public final int b() {
      return this.a() * 100 * 2 / 3;
   }

   public final boolean a() {
      if (this.a < 9) {
         int var1 = this.b();
         if (this.a >= var1) {
            this.a -= var1;
            this.a((byte)(this.a + 1));
            return true;
         }
      }

      return false;
   }

   public final boolean a(c var1, int var2, int var3) {
      return this.f != 4 && this.g > 0 && Math.abs(this.c - var2) + Math.abs(this.d - var3) == 1 && d[this.d] == 1;
   }

   public final void b(byte var1) {
      this.g |= var1;
      this.b();
      if (var1 == 1) {
         this.i = a.f;
      }
   }

   public final void c(byte var1) {
      this.g = (byte)(this.g & ~var1);
      this.b();
   }

   public final void b() {
      this.e = 0;
      this.f = 0;
      this.g = 0;
      if ((this.g & 1) != 0) {
         this.f = (short)(this.f - 10);
         this.g = (short)(this.g - 10);
      }

      if ((this.g & 2) != 0) {
         this.f = (short)(this.f + 10);
      }
   }

   public final void a(int var1, int var2) {
      this.c = (short)var1;
      this.d = (short)var2;
      super.n = (short)(var1 * 24);
      super.o = (short)(var2 * 24);
   }

   public final int c() {
      int var1 = 100 / this.a.length;
      int var2 = this.g / var1;
      if (this.g != 100 && this.g % var1 > 0) {
         var2++;
      }

      return var2;
   }

   public final int a(int var1, int var2, c var3) {
      return (this.d + this.e + this.f + this.a(var3, var1, var2) + this.b(var3, var1, var2)) * this.g / 100;
   }

   public final void a(byte[][] var1, int var2, int var3) {
      byte var4 = d[this.d];
      byte var5 = c[this.d];
      int var6;
      if ((var6 = var2 - var5) < 0) {
         var6 = 0;
      }

      int var7;
      if ((var7 = var3 - var5) < 0) {
         var7 = 0;
      }

      int var8;
      if ((var8 = var2 + var5) >= a.o) {
         var8 = a.o - 1;
      }

      int var9;
      if ((var9 = var3 + var5) >= a.p) {
         var9 = a.p - 1;
      }

      for (int var10 = var6; var10 <= var8; var10++) {
         for (int var11 = var7; var11 <= var9; var11++) {
            int var12;
            if ((var12 = Math.abs(var10 - var2) + Math.abs(var11 - var3)) >= var4 && var12 <= var5 && var1[var10][var11] <= 0) {
               var1[var10][var11] = 127;
            }
         }
      }
   }

   public final void a(byte[][] var1) {
      if (this.a((short)512)) {
         this.a(var1, this.c, this.d);
      } else {
         this.b(var1);

         for (int var2 = 0; var2 < a.o; var2++) {
            for (int var3 = 0; var3 < a.p; var3++) {
               if (var1[var2][var3] > 0 && var1[var2][var3] != 127) {
                  this.a(var1, var2, var3);
               }
            }
         }
      }
   }

   public final c[] a(int var1, int var2, byte var3) {
      return this.a(var1, var2, d[this.d], c[this.d], var3);
   }

   public final c[] a(int var1, int var2, int var3, int var4, byte var5) {
      Vector var6 = new Vector();
      int var7;
      if ((var7 = var1 - var4) < 0) {
         var7 = 0;
      }

      int var8;
      if ((var8 = var2 - var4) < 0) {
         var8 = 0;
      }

      int var9;
      if ((var9 = var1 + var4) >= a.o) {
         var9 = a.o - 1;
      }

      int var10;
      if ((var10 = var2 + var4) >= a.p) {
         var10 = a.p - 1;
      }

      for (int var11 = var7; var11 <= var9; var11++) {
         for (int var12 = var8; var12 <= var10; var12++) {
            int var13;
            if ((var13 = Math.abs(var11 - var1) + Math.abs(var12 - var2)) >= var3 && var13 <= var4) {
               if (var5 == 0) {
                  c var14;
                  if ((var14 = a.a((int)var11, var12, (byte)0)) != null) {
                     if (a.k[var14.e] != a.k[this.e]) {
                        var6.addElement(var14);
                     }
                  } else if (this.d == 7 && a.a(var11, var12) == 8 && a.b[var11][var12] >= a.j && !a.a((int)var11, var12, (int)a.k[this.e])) {
                     c var15;
                     (var15 = a((byte)0, (byte)0, var11, var12, false)).d = -1;
                     var15.f = 4;
                     var6.addElement(var15);
                  }
               } else if (var5 == 1) {
                  c var17;
                  if ((var17 = a.a((int)var11, var12, (byte)1)) != null) {
                     var6.addElement(var17);
                  }
               } else {
                  c var18;
                  if (var5 == 2 && (var18 = a.a((int)var11, var12, (byte)0)) != null && a.k[var18.e] == a.k[this.e]) {
                     var6.addElement(var18);
                  }
               }
            }
         }
      }

      c[] var16 = new c[var6.size()];
      var6.copyInto(var16);
      return var16;
   }

   public final void a(int var1, int var2, boolean var3) {
      this.a(var1, var2, var3, false);
   }

   public final void a(int var1, int var2, boolean var3, boolean var4) {
      if (var3) {
         this.a = this.a(this.c, this.d, var1, var2);
      } else {
         if (var4 && a.a((int)var1, var2, (byte)0) != null) {
            boolean var5 = false;

            for (int var6 = var1 - 1; var6 <= var1 + 1; var6++) {
               for (int var7 = var2 - 1; var7 <= var2 + 1; var7++) {
                  if (((var6 != var1 || var7 != var2) && var6 == var1 || var7 == var2) && a.a((int)var6, var7, (byte)0) == null) {
                     var1 = var6;
                     var2 = var7;
                     var5 = true;
                     break;
                  }
               }

               if (var5) {
                  break;
               }
            }
         }

         this.a = new Vector();
         short[] var12 = new short[]{this.c, this.d};
         this.a.addElement(var12);
         short var13 = this.c;
         int var14;
         if ((var14 = Math.abs(var1 - this.c)) > 0) {
            int var8 = (var1 - this.c) / var14;

            for (int var9 = 0; var9 < var14; var9++) {
               var13 = (short)(var13 + var8);
               short[] var10 = new short[]{var13, this.d};
               this.a.addElement(var10);
            }
         }

         short var16 = this.d;
         if ((var14 = Math.abs(var2 - this.d)) > 0) {
            int var17 = (var2 - this.d) / var14;

            for (int var18 = 0; var18 < var14; var18++) {
               var16 = (short)(var16 + var17);
               short[] var11 = new short[]{var13, var16};
               this.a.addElement(var11);
            }
         }
      }

      this.b = var1;
      this.c = var2;
      this.b = 1;
      this.f = 1;
   }

   public final Vector a(int var1, int var2, int var3, int var4) {
      Vector var5 = null;
      short[] var6 = new short[]{(short)var3, (short)var4};
      if (var1 == var3 && var2 == var4) {
         (var5 = new Vector()).addElement(var6);
         return var5;
      }

      byte var8 = 0;
      byte var9 = 0;
      byte var10 = 0;
      byte var11 = 0;
      if (var4 > 0) {
         var8 = a.c[var3][var4 - 1];
      }

      if (var4 < a.p - 1) {
         var9 = a.c[var3][var4 + 1];
      }

      if (var3 > 0) {
         var10 = a.c[var3 - 1][var4];
      }

      if (var3 < a.o - 1) {
         var11 = a.c[var3 + 1][var4];
      }

      int var7;
      if ((var7 = Math.max(Math.max(var8, var9), Math.max(var10, var11))) == var8) {
         var5 = this.a(var1, var2, var3, var4 - 1);
      } else if (var7 == var9) {
         var5 = this.a(var1, var2, var3, var4 + 1);
      } else if (var7 == var10) {
         var5 = this.a(var1, var2, var3 - 1, var4);
      } else if (var7 == var11) {
         var5 = this.a(var1, var2, var3 + 1, var4);
      }

      var5.addElement(var6);
      return var5;
   }

   public final void b(byte[][] var1) {
      a(var1, this.c, this.d, a[this.d] + this.e, -1, this.d, this.e, false);
   }

   public static final boolean a(byte[][] var0, int var1, int var2, int var3, int var4, byte var5, byte var6, boolean var7) {
      if (var3 > var0[var1][var2]) {
         var0[var1][var2] = (byte)var3;
         if (var7 && a.a((int)var1, var2, (byte)0) == null) {
            return true;
         }

         int var8;
         if (var4 != 1 && (var8 = var3 - a(var1, var2 - 1, var5, var6)) >= 0 && a(var0, var1, var2 - 1, var8, 2, var5, var6, var7) && var7) {
            return true;
         }

         if (var4 != 2 && (var8 = var3 - a(var1, var2 + 1, var5, var6)) >= 0 && a(var0, var1, var2 + 1, var8, 1, var5, var6, var7) && var7) {
            return true;
         }

         int var11;
         return var4 != 4 && (var8 = var3 - a(var1 - 1, var2, var5, var6)) >= 0 && a(var0, var1 - 1, var2, var8, 8, var5, var6, var7) && var7
            ? true
            : var4 != 8 && (var11 = var3 - a(var1 + 1, var2, var5, var6)) >= 0 && a(var0, var1 + 1, var2, var11, 4, var5, var6, var7) && var7;
      } else {
         return false;
      }
   }

   public static final int a(int var0, int var1, byte var2, byte var3) {
      if (var0 >= 0 && var1 >= 0 && var0 < a.o && var1 < a.p) {
         c var4;
         if ((var4 = a.a((int)var0, var1, (byte)0)) != null && a.k[var4.e] != a.k[var3]) {
            return 1000;
         }

         byte var5 = a.a(var0, var1);
         if (var2 == 11) {
            if (var5 == 4) {
               return 1000;
            }
         } else {
            if (a(var2, (short)1)) {
               return 1;
            }

            if (a(var2, (short)2) && var5 == 5) {
               return 1;
            }
         }

         return i.g[var5];
      } else {
         return 10000;
      }
   }

   public final void c() {
      if (this.a) {
         if (a.c - this.b >= this.h) {
            this.a = false;
         } else {
            this.b = !this.b;
         }
      }

      if (this.f == 1) {
         if (this.b >= this.a.size()) {
            this.f = 0;
            this.c = (short)(super.n / 24);
            this.d = (short)(super.o / 24);
            this.a = null;
            this.b = 0;
         } else {
            if (this.a != null && super.n % 24 == 0 && super.o % 24 == 0) {
               this.a.a(this.c, this.d, false);
            }

            short[] var1;
            int var2 = (var1 = (short[])this.a.elementAt(this.b))[0] * 24;
            int var3 = var1[1] * 24;
            f var4 = null;
            if (this.a == null && ++this.i >= 24 / c / 2) {
               var4 = a.a(a.r, super.n, super.o, 0, 0, 1, e.a(1, 4) * 50);
               this.i = 0;
            }

            if (var2 < super.n) {
               super.n = super.n - c;
               if (var4 != null) {
                  var4.b(super.n + super.p, super.o + super.q - var4.q);
               }
            } else if (var2 > super.n) {
               super.n = super.n + c;
               if (var4 != null) {
                  var4.b(super.n - var4.p, super.o + super.q - var4.q);
               }
            } else if (var3 < super.o) {
               super.o = super.o - c;
               if (var4 != null) {
                  var4.b(super.n + (super.p - var4.p) / 2, super.o + super.q);
               }
            } else if (var3 > super.o) {
               super.o = super.o + c;
               if (var4 != null) {
                  var4.b(super.n + (super.p - var4.p) / 2, super.o - var4.q);
               }
            }

            if (super.n == var2 && super.o == var3) {
               this.c = var1[0];
               this.d = var1[1];
               this.b++;
            }
         }

         super.b(super.n, super.o);
         this.e();
      } else {
         if (this.f == 0 && a.c - this.a >= 200L) {
            this.e();
            this.a = a.c;
         }
      }
   }

   public static final boolean a(byte var0, short var1) {
      return (b[var0] & var1) != 0;
   }

   public final boolean a(short var1) {
      return a(this.d, var1);
   }

   public final void d() {
      this.f = 2;
      c var1;
      if ((var1 = a.a(this.c, this.d, (byte)1)) != null) {
         var1.a();
      }

      if (this.a((short)256)) {
         c[] var2 = this.a(this.c, this.d, 1, 2, (byte)2);

         for (int var3 = 0; var3 < var2.length; var3++) {
            var2[var3].b((byte)2);
            a.a(a.h, var2[var3].n, var2[var3].o, 0, 0, 1, 50);
         }
      }

      a.r = this;
   }

   public static final c[] a(byte var0) {
      c[] var1 = new c[a.e[var0]];
      int var2 = 0;

      for (int var3 = 0; var3 < var1.length; var3++) {
         if (a.a[a.f][var3] != null && a.a[a.f][var3].f == 3) {
            var1[var2++] = a.a[a.f][var3];
         }
      }

      c[] var5 = new c[a.I + 1 + var2];

      for (byte var4 = 0; var4 < var5.length; var4++) {
         if (var4 < var2) {
            var5[var4] = var1[var4];
         } else {
            var5[var4] = a((byte)(var4 - var2), var0, 0, 0, false);
         }
      }

      return var5;
   }

   public final void a(Graphics var1, int var2, int var3) {
      this.a(var1, var2, var3, false);
   }

   public final void a(Graphics var1, int var2, int var3, boolean var4) {
      if (this.f != 4) {
         if (this.a) {
            byte var5;
            if (this.b) {
               var5 = -2;
            } else {
               var5 = 2;
            }

            int var6 = e.a() % 1;
            super.a(var1, var2 + var5, var3 + var6);
         } else if (!var4 && this.f != 2) {
            super.a(var1, var2, var3);
         } else {
            a.a[0][this.d].a(var1, super.n + var2, super.o + var3);
         }

         if (this.d == 9) {
            int var7 = super.n + var2;
            int var8 = super.o + var3;
            if (var4 || this.f == 2) {
               a.b[1].a(var1, this.j * 2 + super.m, var7, var8, 0);
               return;
            }

            a.b[0].a(var1, this.j * 2 + super.m, var7, var8, 0);
         }
      }
   }

   public final void b(Graphics var1, int var2, int var3) {
      int var4 = super.n + var2;
      int var5 = super.o + var3;
      if (this.f != 3 && this.g < 100) {
         e.a(var1, "" + this.g, var4, var5 + super.q - 7, 0);
      }
   }

   public static final void a(i var0) throws Exception {
      a = var0;
      DataInputStream var1 = new DataInputStream(e.a("units.bin"));

      for (int var2 = 0; var2 < 12; var2++) {
         a[var2] = var1.readByte();
         b[var2][0] = var1.readByte();
         b[var2][1] = var1.readByte();
         b[var2] = var1.readByte();
         c[var2] = var1.readByte();
         d[var2] = var1.readByte();
         a[var2] = var1.readShort();
         byte var3 = var1.readByte();
         a[var2] = new byte[var3][2];

         for (int var4 = 0; var4 < var3; var4++) {
            a[var2][var4][0] = var1.readByte();
            a[var2][var4][1] = var1.readByte();
         }

         byte var6 = var1.readByte();

         for (int var5 = 0; var5 < var6; var5++) {
            b[var2] = (short)(b[var2] | 1 << var1.readByte());
         }
      }

      var1.close();
   }

   static {
      c = b;
   }
}
