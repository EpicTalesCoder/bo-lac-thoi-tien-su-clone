import java.util.Vector;
import javax.microedition.lcdui.Font;
import javax.microedition.lcdui.Graphics;

public final class d extends a {
   public boolean[] a = new boolean[]{false, false};
   public int a = 13553358;
   public static final int b = e.f <= 143 ? 1 : 2;
   public static final int c = b * 2 + 1;
   public byte a = 2;
   public short a = 3;
   public static i a;
   public String[] a;
   public h[] a;
   public int d;
   public int e;
   public int f;
   public int g;
   public int h;
   public Font a = e.b;
   public int i;
   public int j;
   public int k;
   public int l;
   public int m;
   public int n;
   public byte b;
   public int o;
   public boolean a = false;
   public boolean b = false;
   public c[] a;
   public int p;
   public int q;
   public byte c = -1;
   public int r;
   public int s;
   public int t;
   public int u;
   public String[] b;
   public int v = -1;
   public boolean c = true;
   public int w;
   public c a;
   public boolean d = true;
   public a a;
   public int x;
   public f[] a;
   public int y;
   public boolean e = false;
   public Vector a;
   public int z = -1;
   public boolean f;
   public boolean g;
   public int A;
   public int B;
   public int C;
   public int D;
   public byte[][] a;
   public Vector b;
   public int E;
   public int F;
   public int G = 2370117;
   public int H = 2370117;
   public h a;
   public d a;
   public int[] a;
   public int I;
   public int J;
   public int[] b;
   public int K;
   public int L = -1;
   public short[] a;
   public int M;
   public int N;
   public int O;
   public int P;
   public int Q;
   public int R;
   public int S;
   public int T;
   public int U;
   public int V;
   public byte d;
   public f a;

   public final void a() {
      this.T = 0;
      if (this.a != null) {
         this.b();
      }

      this.y = 4;
      this.a = true;
      this.b = true;
      if (a != null) {
         a.a();
      }

      if (this.a != null) {
         this.a.a = true;
      }

      if (this.b == 15) {
         for (int var1 = 0; var1 < this.a.size(); var1++) {
            d var2;
            (var2 = (d)this.a.elementAt(var1)).a();
            var2.b = false;
         }
      }
   }

   public final void a(byte var1, boolean var2) {
      this.a[var1] = var2;
   }

   public final void a(a var1) {
      this.a = var1;
      this.a[1] = var1 != null;
   }

   public d(byte var1, int var2) {
      this.b = var1;
      this.o = var2;
      if (var1 == 15) {
         this.K = a.b - a.e.q;
         this.c = true;
      } else if (var1 == 0 || var1 == 11) {
         this.a[0] = true;
         this.a[1] = true;
      } else if (var1 == 3) {
         this.a = a.m;
         this.e();
         this.c = false;
         this.f = true;
         this.p = e.b - e.a;
         this.f = a.a;
         this.g = a.m.q + c;
         if ((var2 & 2) == 0) {
            this.g += 5;
         }

         this.a = c.a(a.f);
         this.j = this.a.length;
         boolean var3 = false;
         int var4 = this.f - a.c.p * 2;
         if ((var2 & 4) == 0) {
            var4 -= 8;
         }

         if ((var2 & 8) == 0) {
            var4 -= 8;
         }

         this.s = var4 / (a.m.p + 3);
         if (this.s > this.j) {
            this.s = this.j;
         }

         this.h = var4 / this.s;
         this.x = (var4 - this.h * this.s) / 2;
         this.a = 2;
      } else if (var1 == 2 || var1 == 5) {
         this.c = false;
         this.g = 5 + b + 24 + c + a.n.q * 2 + b + b + 1;
         if (var1 == 5) {
            this.g = this.g + c + e.a;
            this.a = a.a((int)a.q, a.r, (byte)0);
            this.i = this.a.d;
            this.f = a.a;
         } else {
            this.f = a.a;
         }
      } else if (var1 != 7 && var1 == 8) {
         this.a = 8;
         this.a[0] = true;
      }

      this.a = true;
   }

   public final d a(String var1) {
      this.a = new d((byte)10, 0);
      this.a.a(null, var1, a.a, -1);
      return this.a;
   }

   public final void a(d var1, int var2, int var3, int var4) {
      if (this.a == null) {
         this.a = new Vector();
      }

      if (this.b == null) {
         this.b = new int[5];

         for (int var5 = 0; var5 < 5; var5++) {
            this.b[var5] = this.K;
            if (var5 > 0) {
               this.b[var5] = this.b[var5] - a.e.q;
            }
         }
      }

      var1.a(var2, var3, var4);
      int var7 = var1.e;

      for (int var6 = 0; var6 < 5; var6++) {
         if (var7 < this.b[var6]) {
            if (var7 + var1.g > this.b[var6]) {
               this.b[var6] = var7;
               if (var6 + 1 > this.J) {
                  this.J = var6 + 1;
               }
            }
            break;
         }

         var7 -= this.b[var6];
      }

      var1.a((byte)0, false);
      var1.a((byte)1, false);
      this.a.addElement(var1);
   }

   public final void a(int var1, int var2, byte[][] var3, Vector var4) {
      this.o = 15;
      this.a = var3;
      this.b = var4;
      this.a = 8;
      this.a[0] = true;
      this.c = true;
      this.E = var3.length;
      this.F = var3[0].length;
      boolean var5 = false;
      this.f = this.E * a.c[0].a + 8;
      this.g = this.F * a.c[0].b + 8;
      if (this.f > var1) {
         int var6 = a.c[0].a;
         this.C = (var1 - 8) / var6;
         this.f = var6 * this.C + 8;
      } else {
         this.C = this.E;
      }

      if (this.g > var2) {
         int var7 = a.c[0].b;
         this.D = (var2 - 8) / var7;
         this.g = var7 * this.D + 8;
      } else {
         this.D = this.F;
      }

      this.b = 8;
   }

   public final void a(int var1, int var2, int var3) {
      this.d = var1;
      this.e = var2;
      if ((var3 & 1) != 0) {
         this.d = this.d - (this.f >> 1);
      } else if ((var3 & 8) != 0) {
         this.d = this.d - this.f;
      }

      if ((var3 & 2) != 0) {
         this.e = this.e - (this.g >> 1);
      } else if ((var3 & 32) != 0) {
         this.e = this.e - this.g;
      }

      this.m = this.d;
      this.n = this.e;
   }

   public final void a(String var1, int var2, int var3, byte var4, byte var5) {
      this.c = var4;
      if (var4 == -1) {
         this.o = 14;
      } else {
         this.t = a.l.p - 8;
      }

      int var6 = var2 - this.t - 16;
      this.a = a.a(var1, var6, e.b);
      this.a(null, this.a, var2, var3);
      this.e = false;
      this.b = 7;
   }

   public final void a(String var1, String[] var2, int var3, int var4) {
      this.c = false;
      this.f = var3;
      this.g = var4;
      this.j = var2.length;
      this.i = 0;
      this.r = 0;
      this.u = 0;
      this.e = false;
      int var5 = var3 - this.t - 16;
      if (var1 != null) {
         this.b = a.a(var1, var5, e.b);
      }

      this.a = var2;
      this.h = e.b;
      this.p = e.b - e.a;
      this.q = this.p / 2;
      int var6;
      if (var4 <= 0) {
         var6 = super.X;
      } else {
         var6 = var4;
      }

      if ((this.o & 1) == 0) {
         var6 -= 5;
      }

      if ((this.o & 2) == 0) {
         var6 -= 5;
      }

      if (var1 != null) {
         var6 -= this.b.length * this.h;
      }

      this.s = (var6 - 2) / this.h;
      if (this.s > this.a.length) {
         this.s = this.a.length;
      } else if (this.s < this.a.length) {
         this.e = true;
      }

      if (var4 < 0) {
         if (this.b != null) {
            this.g = this.b.length * this.h;
         }

         this.g = this.g + this.s * this.h;
         if ((this.o & 1) == 0) {
            this.g += 5;
         }

         if ((this.o & 2) == 0) {
            this.g += 5;
         }
      } else {
         this.x = (var6 - this.s * this.h) / 2;
      }

      this.b = 10;
      this.a = 2;
   }

   public final void a(String var1, String var2, int var3, int var4) {
      int var5 = var3 - this.t;
      if ((this.o & 4) == 0) {
         var5 -= 8;
      }

      if ((this.o & 8) == 0) {
         var5 -= 8;
      }

      this.a = a.a(var2, var5, e.b);
      this.a(var1, this.a, var3, var4);
      if (this.e) {
         var5 -= a.d.p;
         this.a = a.a(var2, var5, e.b);
         this.a(var1, this.a, var3, var4);
      }
   }

   private final void e() {
      this.a = new f[3];

      for (int var1 = 0; var1 < this.a.length; var1++) {
         this.a[var1] = new f(a.k);
      }

      this.b();
   }

   public final void b() {
      for (int var1 = 0; var1 < this.a.length; var1++) {
         this.a[var1].c = true;
         this.a[var1].b(e.a(this.a.p), e.a(this.a.q));
         this.a[var1].c(e.a(this.a[var1].e()));
      }
   }

   public final void a(String[] var1, h[] var2, int var3, int var4, int var5) {
      this.o = 15;
      this.a = var1;
      this.a = var2;
      this.j = this.a.length;
      this.f = 0;

      for (int var6 = 0; var6 < this.j; var6++) {
         int var7;
         if ((var7 = e.b.stringWidth(this.a[var6])) > this.f) {
            this.f = var7;
         }
      }

      this.p = e.b - e.a;
      this.q = this.p / 2;
      this.U = a.n.p;
      this.h = this.U + this.p;
      this.f = this.f + this.j * this.h;
      this.f += 32;
      if (this.f > super.W) {
         this.f = super.W;
      }

      this.g = this.U;
      this.a(var3, var4, var5);
      this.b = 13;
      this.a = 2;
   }

   public final void a(String[] var1, int var2, int var3) {
      this.a = var1;
      this.j = this.a.length;
      this.f = true;
      this.c = false;
      this.g = var3;
      int var4 = 0;

      for (int var5 = 0; var5 < this.a.length; var5++) {
         int var6;
         if ((var6 = e.b.stringWidth(this.a[var5])) > var4) {
            var4 = var6;
         }
      }

      this.f = var4 + 16 + a.c.p * 2;
      if (this.f < var2) {
         this.f = var2;
      }

      if (this.g < 0) {
         this.g = e.b;
         if (a.c.q > this.g) {
            this.g = a.c.q;
         }

         if ((this.o & 1) == 0) {
            this.g += 5;
         }

         if ((this.o & 2) == 0) {
            this.g += 5;
         }
      }

      this.b = 14;
      this.a = 2;
   }

   public final void a(String[] var1, int var2, int var3, int var4, int var5, int var6, int var7) {
      this.a = var1;
      this.j = this.a.length;
      this.p = e.b - e.a;
      this.h = e.b;
      int var8 = 0;

      for (int var9 = 0; var9 < this.a.length; var9++) {
         int var10;
         if ((var10 = e.b.stringWidth(this.a[var9])) > var8) {
            var8 = var10;
         }
      }

      this.f = var8 + 4 + 16;
      if (this.f > super.W) {
         this.f = super.W;
      } else if (this.f < var4) {
         if (var7 == 4) {
            this.L = (var4 - this.f) / 2;
         }

         this.f = var4;
      }

      this.g = this.h * this.a.length + this.p + 16;
      if (this.g > var5) {
         this.g = var5;
      }

      this.a(null, this.a, this.f, this.g);
      if (this.f < super.W && this.e) {
         this.f = this.f + a.d.p;
      }

      this.b = 11;
      this.a(var2, var3, var6);
   }

   public final void a(String[] var1, h[] var2, int var3, int var4, int var5, int var6, byte var7) {
      this.d = var7;
      this.a = var1;
      this.a = var2;
      this.j = this.a.length;
      if (var7 == 1) {
         this.a = a.m;
      } else if (var7 == 2) {
         this.a = a.n;
         if (this.j < 4) {
            String[] var8 = new String[4];
            System.arraycopy(this.a, 0, var8, 0, this.j);
            this.a = var8;
            this.j = 4;
         }
      }

      this.p = e.b - e.a;
      this.o = 15;
      this.U = this.a.p;
      this.V = this.U >> 1;
      this.e();
      this.a = new short[this.j];
      this.R = 360 / this.j;
      this.Q = this.R / 2;
      this.P = this.Q;

      for (int var9 = 0; var9 < this.j; var9++) {
         this.a[var9] = (short)(this.R * var9);
      }

      if (this.j == 1) {
         this.N = 0;
      } else if (var5 <= 0) {
         this.N = (this.a.p << 10) / (2 * a.a(45));
         this.O = this.N + this.a.p / 2;
         var5 = this.O * 2 + e.b + 2;
      } else {
         int var10 = (this.a.p << 10) / a.a(this.R / 2) + this.a.q / 2;
         this.O = (var5 - e.b) / 2 - 2;
         if (this.O > var10) {
            this.O = var10;
         }

         this.N = this.O - this.a.q / 2;
      }

      this.M = 0;
      this.f = this.O * 2;
      this.g = var5;
      this.a = 0;
      this.a(var3, var4, var6);
   }

   public final int a(int var1) {
      int var2 = this.z;
      int var3 = this.z;
      int var4 = this.a.size();

      do {
         if ((var2 += var1) < 0) {
            var2 = var4 - 1;
         } else if (var2 >= this.a.size()) {
            if (var3 < 0) {
               return -1;
            }

            var2 = 0;
         }
      } while (!((d)this.a.elementAt(var2)).f);

      return var2;
   }

   public final void c() throws Exception {
      this.a(true);
   }

   public final void a(boolean var1) throws Exception {
      if (this.a != 3) {
         if (this.b == 10 && this.v > 0 && this.v <= 250) {
            this.y++;
            this.a = true;
         } else if (this.y > 0) {
            this.y--;
            this.a = true;
         }

         if (var1 && this.a == 2) {
            boolean var2 = false;
            if (this.a[0] && (a.a.a(i.h) || a.a.a(16))) {
               var2 = true;
               a.a.b(i.h);
               a.a.b(16);
            }

            if (this.b == 0 || this.b == 3) {
               for (int var3 = 0; var3 < this.a.length; var3++) {
                  if (this.a[var3].m == this.a[var3].e() - 1) {
                     if (this.T == 0) {
                        this.a[var3].b(e.a(this.a.p - this.a[var3].p), e.a(this.a.q - this.a[var3].q));
                     } else {
                        this.a[var3].c = false;
                     }
                  }

                  this.a[var3].e();
               }

               this.a = true;
            }

            if (this.b == 15) {
               if (!this.g && this.z >= 0) {
                  if (a.a.a(1)) {
                     ((d)this.a.elementAt(this.z)).a = true;
                     this.z = this.a(-1);
                     d var11;
                     (var11 = (d)this.a.elementAt(this.z)).a = true;
                     int var4 = var11.e;

                     for (int var5 = 0; var5 < 5; var5++) {
                        if (var4 < this.b[var5]) {
                           if (this.I != var5) {
                              this.a();
                              this.I = var5;
                           }
                           break;
                        }

                        var4 -= this.b[var5];
                     }
                  } else if (a.a.a(2)) {
                     ((d)this.a.elementAt(this.z)).a = true;
                     this.z = this.a(1);
                     d var12;
                     (var12 = (d)this.a.elementAt(this.z)).a = true;
                     int var14 = var12.e;

                     for (int var16 = 0; var16 < 5; var16++) {
                        if (var14 < this.b[var16]) {
                           if (this.I != var16) {
                              this.a();
                              this.I = var16;
                           }
                           break;
                        }

                        var14 -= this.b[var16];
                     }
                  }
               }

               if (var2) {
                  a.a(this, this.z, "", (byte)0);
                  return;
               }

               for (int var13 = 0; var13 < this.a.size(); var13++) {
                  d var15 = (d)this.a.elementAt(var13);
                  if (this.g) {
                     var15.a(true);
                  } else {
                     var15.a(var13 == this.z);
                  }
               }

               this.a = true;
            } else if (this.b == 0) {
               if (this.a == 2) {
                  this.a = true;
                  if (a.a.a(4)) {
                     this.T = this.T - this.R;
                     this.S = this.S + this.R;
                     this.i--;
                     if (this.i < 0) {
                        this.i = this.j - 1;
                     }
                  } else if (a.a.a(8)) {
                     this.T = this.T + this.R;
                     this.S = this.S - this.R;
                     if (this.S < 0) {
                        this.S += 360;
                     }

                     this.i++;
                     if (this.i >= this.j) {
                        this.i = 0;
                     }
                  }

                  if (this.T != 0) {
                     int var10;
                     if ((var10 = -this.T / 2) == 0) {
                        this.T = 0;
                     } else {
                        this.T += var10;
                     }

                     if (this.T == 0) {
                        this.b();
                     }
                  } else if (a.a.c(4)) {
                     this.T = this.T - this.R;
                     this.S = this.S + this.R;
                     this.i--;
                     if (this.i < 0) {
                        this.i = this.j - 1;
                     }
                  } else if (a.a.c(8)) {
                     this.T = this.T + this.R;
                     this.S = this.S - this.R;
                     if (this.S < 0) {
                        this.S += 360;
                     }

                     this.i++;
                     if (this.i >= this.j) {
                        this.i = 0;
                     }
                  }

                  if (var2) {
                     a.a(this, this.i, this.a[this.i], (byte)0);
                     return;
                  }
               }
            } else if (this.b != 13 && this.b != 14) {
               if (this.b == 3) {
                  if (this.u != 0) {
                     if (Math.abs(this.u) < 2) {
                        this.u = 0;
                     } else {
                        this.u = this.u - this.u / 2;
                     }

                     this.a = true;
                  }

                  if (var2) {
                     a.a(this, this.i, this.a[this.i], (byte)0);
                     return;
                  }

                  if (a.a.a(4)) {
                     if (this.i < this.r) {
                        this.i = this.i + this.j;
                     }

                     this.i--;
                     if (this.i < this.r) {
                        if (this.i < 0) {
                           this.i = this.i + this.j;
                        }

                        this.r = this.i;
                        this.u = -this.h;
                     }

                     this.i = this.i % this.j;
                     a.a(this, this.i, null, (byte)2);
                     this.b();
                     this.a = true;
                  } else if (a.a.a(8)) {
                     if (this.i < this.r) {
                        this.i = this.i + this.j;
                     }

                     this.i++;
                     if (this.i >= this.r + this.s) {
                        this.u = this.h;
                        this.r = (this.r + 1) % this.j;
                     }

                     this.i = this.i % this.j;
                     a.a(this, this.i, null, (byte)3);
                     this.b();
                     this.a = true;
                  }
               } else if (this.b != 10 && this.b != 7 && this.b != 11) {
                  if (this.b == 8) {
                     if (a.a.a(1)) {
                        if (this.B > 0) {
                           this.B--;
                           this.a = true;
                        }
                     } else if (a.a.a(2) && this.B + this.D < this.F) {
                        this.B++;
                        this.a = true;
                     }

                     if (a.a.a(4)) {
                        if (this.A > 0) {
                           this.A--;
                           this.a = true;
                        }
                     } else if (a.a.a(8) && this.A + this.C < this.E) {
                        this.A++;
                        this.a = true;
                     }
                  }
               } else {
                  if (this.v != -1) {
                     if (this.v > 0) {
                        this.v -= 50;
                     } else {
                        a.a.a(this.a);
                     }
                  }

                  if (this.u > 0) {
                     this.u = this.u - (this.h / 3 + 1);
                     if (this.u < 0) {
                        this.u = 0;
                     }

                     this.a = true;
                  } else if (this.u < 0) {
                     this.u = this.u + this.h / 3 + 1;
                     if (this.u > 0) {
                        this.u = 0;
                     }

                     this.a = true;
                  }

                  if (this.u == 0) {
                     if ((this.b == 11 || this.b == 10) && var2) {
                        a.a(this, this.i, this.a[this.i], (byte)0);
                        return;
                     }

                     if (this.b != 7 && a.a.a(1)) {
                        if (this.b == 11) {
                           this.i--;
                           if (this.i < 0) {
                              this.i = this.j - 1;
                              this.r = this.j - this.s;
                              if (this.b == 3) {
                                 this.r = this.i;
                              }
                           } else if (this.i < this.r) {
                              this.u = -this.h;
                              this.r--;
                           }

                           a.a(this, this.i, null, (byte)2);
                           this.a = true;
                        } else if (this.r > 0) {
                           this.u = -this.h;
                           this.r--;
                           this.a = true;
                        }

                        a.a.b();
                     }

                     if (a.a.a(2) || this.b == 7 && a.a.a(2048)) {
                        if (this.b == 11) {
                           this.i++;
                           if (this.i >= this.j) {
                              this.i = 0;
                              this.r = 0;
                           } else if (this.i >= this.r + this.s) {
                              this.u = this.h;
                              this.r++;
                           }

                           a.a(this, this.i, null, (byte)3);
                           this.a = true;
                        } else if (this.r + this.s < this.a.length) {
                           this.u = this.h;
                           this.r++;
                           this.a = true;
                        } else if (this.b == 7) {
                           a.a(this, 0, null, (byte)0);
                           return;
                        }

                        a.a.b();
                     }
                  }
               }
            } else if (a.a.a(4)) {
               this.i--;
               if (this.i < 0) {
                  this.i = this.j - 1;
               }

               if (this.b == 14) {
                  a.a(this, this.i, null, (byte)2);
               }

               this.a = true;
            } else if (a.a.a(8)) {
               this.i++;
               if (this.i >= this.j) {
                  this.i = 0;
               }

               if (this.b == 14) {
                  a.a(this, this.i, null, (byte)2);
               }

               this.a = true;
            } else if (var2) {
               a.a(this, this.i, this.a[this.i], (byte)0);
               return;
            }

            if (this.a == 2 && this.a[1] && a.a.a(i.i)) {
               a.a.b(i.i);
               a.a.b();
               if (this.a != null) {
                  a.a.a(this.a);
               }

               if (this.a != null) {
                  a.a(this, this.i, this.a[this.i], (byte)1);
                  return;
               }

               a.a(this, -1, null, (byte)1);
               return;
            }
         }

         if (this.c && ++this.l >= this.a) {
            if (this.k == 0) {
               this.k = 2;
            } else {
               this.k = 0;
            }

            this.l = 0;
            this.a = true;
         }

         switch (this.a) {
            case 0:
               if (this.b == 0) {
                  if (this.M < this.N) {
                     int var6;
                     if (this.d == 2) {
                        var6 = this.N / 2;
                     } else {
                        var6 = this.N / 5;
                     }

                     if (var6 < 1) {
                        var6 = 1;
                     }

                     this.M += var6;
                     if (this.M > this.N) {
                        this.M = this.N;
                     }
                  } else {
                     this.P = Math.abs(360 - this.a[0]) / 2;
                     if (this.P < 1) {
                        this.P = 1;
                     } else if (this.P > this.Q) {
                        this.P = this.Q;
                     }
                  }

                  if (this.d == 1) {
                     for (int var7 = 0; var7 < this.a.length; var7++) {
                        this.a[var7] = (short)((this.a[var7] + this.P) % 360);
                     }
                  }

                  if (a.a.a() || this.M >= this.N && this.a[0] == 0) {
                     this.M = this.N;

                     for (int var8 = 0; var8 < this.a.length; var8++) {
                        this.a[var8] = (short)(this.R * var8);
                     }

                     this.a = 2;
                     if (this.d) {
                        a.a.b();
                     }
                  }
               } else if (this.b == 13) {
                  this.m = this.m + (this.d - this.m) / 2;
                  this.w++;
                  if (this.w == 2) {
                     this.a = 2;
                     this.m = this.d;
                  }
               } else {
                  int var9;
                  if ((var9 = (this.d - this.m) / 4) <= 0) {
                     var9 = 1;
                  }

                  this.m += var9;
                  if (this.m == this.d) {
                     this.a = 2;
                  }
               }

               this.a = true;
               return;
            case 1:
               this.a = 3;
         }
      }
   }

   public static final void a(Graphics var0, int var1, int var2, int var3, int var4) {
      if (var4 <= 2) {
         var0.fillRect(var1, var2, var3, var4);
      } else {
         var0.fillRect(var1, var2 + 1, var3, var4 - 2);
         var0.fillRect(var1 + 1, var2, var3 - 2, var4);
      }
   }

   public final void a(Graphics var1) {
      this.a(var1, 0, 0, false);
   }

   public final void a(Graphics var1, int var2, int var3, boolean var4) {
      if (this.a != 3) {
         if (this.a) {
            this.a = false;
            if (a.a.a == this && this.b || this.b == 0) {
               a.a(var1);
            }

            this.b = false;
            var1.setClip(0, 0, super.W, super.X);
            if (this.a != null) {
               this.a.a(var1);
            }

            int var5 = this.m + var2;
            int var6 = this.n + var3;
            int var7 = 0;
            int var8 = 0;
            if (this.b != 0 && this.b != 13) {
               a(var1, var5, var6, this.f, this.g, this.o, this.H, this.G, this.y, 5);
               var1.setClip(0, 0, super.W, super.X);
            }

            var7 = this.f;
            var8 = this.g;
            if ((this.o & 1) == 0) {
               var8 -= 5;
               var6 += 5;
            }

            if ((this.o & 2) == 0) {
               var8 -= 5;
            }

            if ((this.o & 4) == 0) {
               var5 += 8;
               var7 -= 8;
            }

            if ((this.o & 8) == 0) {
               var7 -= 8;
            }

            var1.translate(var5, var6);
            var1.setFont(this.a);
            if (this.a != null && (this.a == null || this.a.stringWidth(this.a[0]) < var7 - this.a.a * 2)) {
               this.a.a(var1, 0, var8 / 2, 6);
            }

            if (var4) {
               var1.setColor(5594742);
               a(var1, 0, 0, var7, var8);
            }

            if (this.b == 0) {
               var1.setColor(16777215);
               int var11 = this.S + this.T;

               for (int var12 = this.a.length - 1; var12 >= 0; var12--) {
                  int var13;
                  if ((var13 = (this.a[var12] + var11) % 360) < 0) {
                     var13 += 360;
                  }

                  int var9 = this.O + (a.a(var13) * this.M >> 10);
                  int var10 = e.b + this.O + 2 - (a.b(var13) * this.M >> 10);
                  if (this.a == 2 && var12 == this.i) {
                     this.a.a(var1, 1, var9, var10, 3);
                     if (this.T == 0) {
                        for (int var14 = 0; var14 < this.a.length; var14++) {
                           this.a[var14].a(var1, var9 - this.V, var10 - this.V, 20);
                        }
                     }
                  } else {
                     this.a.a(var1, 0, var9, var10, 3);
                  }

                  if (this.a[var12] != null && this.a != null && this.a[var12] != null) {
                     this.a[var12].a(var1, var9, var10, 3);
                  }
               }

               if (this.a == 2) {
                  for (int var66 = 0; var66 < this.a.length; var66++) {
                     this.a[var66].a(var1, (this.f - this.U) / 2, e.b, 3);
                  }
               }
            }

            switch (this.b) {
               case 0:
                  if (this.a == 2) {
                     var1.setColor(1645370);
                     if (this.d == 2) {
                        int var74 = this.f;
                        if (this.a[this.i] != null) {
                           int var77 = e.b.stringWidth(this.a[this.i]) + 2;
                           if (var74 < var77) {
                              var74 = var77;
                           }
                        }

                        a(var1, (this.f - var74) / 2, 1, var74, e.b);
                     } else {
                        a(var1, 2 - this.d, 1, super.W - 4, e.b);
                     }

                     if (this.a[this.i] != null) {
                        var1.setColor(16777215);
                        e.b(var1, this.a[this.i], this.O, (this.p >> 1) + 1, 17);
                     }
                  }
               case 1:
               case 4:
               case 6:
               case 9:
               case 12:
               default:
                  break;
               case 2:
               case 5:
                  var1.setClip(0, 0, var7, var8);
                  int var73 = b;
                  int var76 = e.a[0].p;
                  int var58 = var73;
                  this.a.a(var1, -this.a.n + var73, -this.a.o + var58);
                  int var64 = var58 + this.a.q / 2;
                  String var78 = null;
                  var1.setFont(e.b);
                  var1.setColor(this.a);
                  e.b(var1, this.a.a, var73 + this.a.p + var73, var64 - e.a / 2, 20);
                  if (this.b == 2) {
                     var78 = "" + this.a.k;
                     a.p.a(var1, 1, var7 - var73 - e.a((byte)1, var78), var64, 10);
                  } else {
                     var78 = "" + this.a.g;
                  }

                  e.a(var1, var78, var7 - var73, var64, 1, 10);
                  this.p = e.b - e.a;
                  var58 += this.a.q + b;
                  var1.setColor(this.a);
                  var1.drawLine(var73, var58, var7 - var73 - var73, var58);
                  var58 += 1 + b;
                  if (this.b == 5) {
                     int var80 = e.a;
                     var64 = var58 + var80 / 2;
                     int var48 = var73;
                     e.b(var1, a.a(97), var48, var58, 20);
                     int var82 = e.b.stringWidth(a.a(97));
                     var48 += var82 + var73;
                     int var84 = var7 - var48 - var73 - a.o.p - var76 - var73;
                     var1.setColor(this.a);
                     a(var1, var48, var58, var84, var80);
                     var1.setColor(2370117);
                     int var86;
                     if ((var86 = var84 * this.a.a / this.a.b()) <= 0) {
                        var86 = 1;
                     }

                     var1.fillRect(var48 + 1, var58 + 1, var86, var80 - 2);
                     var48 = var7 - var73 - var76;
                     a.o.a(var1, 2, var48, var64, 10);
                     e.a(var1, "" + this.a.a, var48, var64, 0, 6);
                     var58 += var80 + b;
                     var1.setColor(this.a);
                     var1.drawLine(var73, var58, var7 - var73 - var73, var58);
                     var58 += 1 + b;
                  }

                  int var81 = (var7 - var73 * 3) / 2;
                  int var83 = a.o.q;
                  int var85 = a.n.q;
                  int var87 = a.n.q / 2;

                  for (int var89 = 0; var89 < 2; var89++) {
                     int var88 = var58 + var87 - var83 / 2;
                     int var51 = var73;

                     for (int var91 = 0; var91 < 2; var91++) {
                        if (var89 == 0 || var91 == 0) {
                           int var93 = var51 + var87;
                           a(var1, var93, var88, var81 - var87, var83);
                           a.n.a(var1, var51, var58);
                           int var94;
                           if ((var94 = var89 * 2 + var91) == 0 || var94 == 1) {
                              a.o.a(var1, var94, var93, var58 + var87, 3);
                           }

                           int var95 = 0;
                           if (var94 == 0) {
                              if (this.b == 5) {
                                 var95 = this.a.a((c)null);
                              }

                              var78 = this.a.d + var95 + "-" + (this.a.e + var95);
                           } else if (var94 == 1) {
                              if (this.b == 5) {
                                 var95 = this.a.b((c)null);
                              }

                              var78 = "" + (this.a.f + var95);
                           } else if (var94 == 2) {
                              a.a[5].a(var1, var93, var58 + var87, 3);
                              var78 = "" + c.a[this.a.d];
                           }

                           e.a(var1, var78, var51 + var85 + 1, var58 + var87, 0, 6);
                           if (var95 > 0) {
                              a.u.a(var1, 1, var93 + var81 - var87 - 1, var58 + var87, 10);
                           } else if (var95 < 0) {
                              a.u.a(var1, 2, var93 + var81 - var87 - 1, var58 + var87, 10);
                           }

                           var51 += var81 + b;
                        }
                     }

                     var58 += var85;
                  }

                  var58 += b;
                  var1.setColor(this.a);
                  var1.drawLine(var73, var58, var7 - var73 - var73, var58);
                  break;
               case 3:
                  var1.setClip(0, 0, var7, var8);
                  int var55 = b;
                  var1.setColor(11515819);
                  var1.drawLine(b, var55, var7 - b * 2, var55);
                  int var56;
                  var55 = (var56 = var55 + 1 + b) + a.m.q / 2;
                  int var47 = a.c.p + this.u + this.x;
                  int var72 = this.r;
                  int var75 = this.r + this.s;
                  if (this.u > 0) {
                     var72--;
                     var47 -= this.h;
                  } else if (this.u < 0) {
                     var75++;
                  }

                  for (int var17 = var72; var17 < var75; var17++) {
                     int var18;
                     if ((var18 = var17 % this.j) < 0) {
                        var18 += this.j;
                     }

                     int var19 = var47 + this.h / 2;
                     if (var18 == this.i) {
                        a.m.a(var1, 1, var19, var55, 3);
                     } else {
                        a.m.a(var1, 0, var19, var55, 3);
                     }

                     c var20 = this.a[var18];
                     int var21 = var19 - var20.n - var20.p / 2;
                     int var22 = var55 - var20.o - var20.q / 2;
                     var20.a(var1, var21, var22, var20.k > a.f[a.f]);
                     if (var18 == this.i) {
                        int var23 = var19 - this.a.p / 2;
                        int var90 = var55 - this.a.p / 2;

                        for (int var92 = 0; var92 < this.a.length; var92++) {
                           this.a[var92].a(var1, var23, var90, 20);
                        }
                     }

                     var47 += this.h;
                  }

                  a.c.a(var1, 0, 0, var55, 6);
                  a.c.a(var1, 1, var7, var55, 10);
                  break;
               case 7:
               case 10:
               case 11:
                  var1.setFont(e.b);
                  if (this.c != -1) {
                     a.l.a(var1, this.c, -8, var8, 36);
                  }

                  var7 -= this.t;
                  var1.setClip(0, 0, var7, this.g - 10);
                  int var104 = 0;
                  int var53 = 0;
                  if (this.b != null) {
                     var1.setColor(i.a(16777215, this.H, this.y, 5));

                     for (int var105 = 0; var105 < this.b.length; var105++) {
                        e.b(var1, this.b[var105], this.t + var7 / 2, var53 + this.q, 17);
                        var53 += this.h;
                     }

                     var1.setColor(10463131);
                     var1.drawLine(0, var53, var7 - 1, var53);
                     var104 = var53;
                  }

                  int var106 = var53 + this.x;
                  var1.setColor(this.a);
                  int var33 = this.r;
                  int var34 = this.r + this.s;
                  if (this.u > 0) {
                     var33--;
                     var53 -= this.h;
                  } else if (this.u < 0) {
                     var34++;
                  }

                  var53 += this.u + this.x;
                  var1.setClip(this.t, var104, var7, var8 - var104);
                  int var35 = var7;
                  if (this.e) {
                     var35 -= a.d.p;
                  }

                  int var36 = this.t + var35 / 2;

                  for (int var37 = var33; var37 < var34; var37++) {
                     int var38 = 0;
                     if (var53 < var106) {
                        var38 = var106 - var53;
                     } else if (var53 + this.h > var8 - this.x) {
                        var38 = var53 + this.h - var8 + this.x;
                     }

                     int var39;
                     if (this.b == 11 && var37 == this.i) {
                        var1.setColor(5594742);
                        a(var1, 0, var53, var35, this.h);
                        var39 = i.a(this.H, 16777215, this.h - var38, this.h);
                     } else {
                        var39 = i.a(this.H, this.a, this.h - var38, this.h);
                     }

                     var39 = i.a(var39, this.H, this.y, 5);
                     var1.setColor(var39);
                     if (this.L >= 0) {
                        e.b(var1, this.a[var37], this.L, var53 + this.q, 20);
                     } else {
                        e.b(var1, this.a[var37], var36, var53 + this.q, 17);
                     }

                     var53 += this.h;
                  }

                  if (this.e) {
                     int var107 = a.d.q;
                     int var109 = a.d.p;
                     int var111 = a.d.p / 2;
                     int var40 = var8 - var107 * 2 - 2;
                     int var41 = var7 - (var109 + var111) / 2;
                     if (var40 > 2) {
                        var1.setColor(this.a);
                        a(var1, var41, var107 + 1, var111, var40);
                        int var42;
                        if ((var42 = (var40 - 2) * this.s / this.j) < 1) {
                           var42 = 1;
                        }

                        var1.setColor(2370117);
                        a(var1, var41 + 1, var107 + (var40 - 2) * this.r / this.j + 2, var111 - 2, var42);
                        a.d.a(var1, 0, var7 - var109, 0, 20);
                        a.d.a(var1, 1, var7 - var109, var8, 36);
                     } else {
                        if (this.r > 0) {
                           a.d.a(var1, 0, var7 - var109, 0, 20);
                        }

                        if (this.r + this.s < this.j) {
                           a.d.a(var1, 1, var7 - var109, var8, 36);
                        }
                     }
                  }

                  if (this.b == 7) {
                     var1.setClip(0, 0, super.W, super.X);
                     int var108 = var8;
                     if ((this.o & 2) == 0) {
                        var108 += 5;
                     }

                     a.d.a(var1, 1, var7 + this.t, var108, 40);
                  }
                  break;
               case 8:
                  a.a(var1, 0, 0, this.f, this.g);
                  int var24 = a.c[0].a;
                  int var25 = a.c[0].b;
                  int var26 = this.D + this.B;
                  int var27 = this.C + this.A;
                  int var52 = 4;

                  for (int var96 = this.B; var96 < var26; var96++) {
                     int var46 = 4;

                     for (int var98 = this.A; var98 < var27; var98++) {
                        int var100 = a.h[this.a[var98][var96]];
                        if (this.a[var98][var96] >= a.j) {
                           int var102 = (this.a[var98][var96] - a.j) / 2;
                           var100 = 2 * var102 + 8 + var100 - 8;
                        }

                        a.c[var100].a(var1, var46, var52);
                        var46 += var24;
                     }

                     var52 += var25;
                  }

                  if (this.b != null && this.k == 0) {
                     int var97 = -this.A * var24 + 4;
                     int var99 = -this.B * var25 + 4;
                     int var101 = 0;

                     for (int var103 = a.a.size(); var101 < var103; var101++) {
                        c var32;
                        if ((var32 = (c)a.a.elementAt(var101)).c >= this.A && var32.c < var27 && var32.d >= this.B && var32.d < var26) {
                           a.q.a(var1, a.j[var32.e] - 1, var32.c * var24 + var97, var32.d * var25 + var99, 0);
                        }
                     }
                  }

                  if (this.k == 0) {
                     if (this.B > 0) {
                        a.d.a(var1, 0, var7 / 2, 0, 17);
                     }

                     if (this.B + this.D < this.F) {
                        a.d.a(var1, 1, var7 / 2, var8, 33);
                     }

                     if (this.A > 0) {
                        a.c.a(var1, 0, 0, var8 / 2, 6);
                     }

                     if (this.A + this.C < this.E) {
                        a.c.a(var1, 1, var7, var8 / 2, 10);
                     }
                  }
                  break;
               case 13:
                  int var28 = e.b;
                  int var29 = (this.g - var28) / 2;
                  var1.setColor(i.a(1645370, 16777215, this.y, 5));
                  a(var1, 0, var29, this.f, var28);
                  var1.setFont(e.b);
                  var1.setColor(16777215);
                  e.b(var1, this.a[this.i], 16, var29 + this.q, 20);
                  int var30 = this.f - this.h;

                  for (int var31 = this.j - 1; var31 >= 0; var31--) {
                     if (var31 == this.i) {
                        a.n.a(var1, 1, var30, 0, 20);
                     } else {
                        a.n.a(var1, 0, var30, 0, 20);
                     }

                     this.a[var31].a(var1, var30 + a.n.p / 2, this.g / 2, 3);
                     var30 -= this.h;
                  }
                  break;
               case 14:
                  var1.setFont(e.b);
                  var1.setColor(i.a(16777215, 1645370, this.y, 5));
                  int var63 = var8 / 2;
                  e.b(var1, this.a[this.i], var7 / 2, (var8 - e.a) / 2, 17);
                  a.c.a(var1, 0, 0, var63, 6);
                  a.c.a(var1, 1, var7, var63, 10);
                  break;
               case 15:
                  int var67 = 0;
                  int var68 = 0;
                  int var69 = this.b[0];

                  for (int var15 = 1; var15 <= this.I; var15++) {
                     var67 = var69;
                     var69 += this.b[var15];
                  }

                  if (this.I > 0) {
                     var68 = -var67 + a.e.q;
                  }

                  for (int var70 = 0; var70 < this.a.size(); var70++) {
                     d var16;
                     if ((var16 = (d)this.a.elementAt(var70)).e >= var67 && var16.e < var69) {
                        var16.a(var1, 0, var68, var70 == this.z);
                     }
                  }

                  var1.setClip(0, 0, a.a, a.b);
                  if (this.I > 0) {
                     var1.setColor(2370117);
                     var1.fillRect(0, 0, super.W, a.e.q);
                     a.d.a(var1, 0, a.a / 2, -this.k, 17);
                  }

                  if (this.I < this.J) {
                     var1.setColor(2370117);
                     int var71 = this.b[this.I];
                     if (this.I > 0) {
                        var71 += a.e.q;
                     }

                     var1.fillRect(0, var71, super.W, a.b - var71);
                     a.d.a(var1, 1, a.a / 2, a.b + this.k, 33);
                  }
            }

            var1.translate(-var5, -var6);
            var1.setClip(0, 0, super.W, super.X);
            if (a.a.a == this && this.a == 2) {
               if (this.a[0]) {
                  a.a(var1, i.h, 0, a.b);
               }

               if (this.a[1]) {
                  a.a(var1, i.i, 1, a.b);
               }
            }
         }
      }
   }

   public static final void a(Graphics var0, int var1, int var2, int var3, int var4, int var5) {
      a(var0, var1, var2, var3, var4, var5, 2370117, 2370117, 0, 0);
   }

   public static final void a(Graphics var0, int var1, int var2, int var3, int var4, int var5, int var6, int var7, int var8, int var9) {
      f var10 = a.f;
      var0.setClip(var1, var2, var3, var4);
      var0.setColor(var6);
      var0.fillRect(var1, var2, var3, var4);
      if (var7 != var6) {
         int var11 = var4 / 4;
         int var12 = var2 + 5;

         for (int var14 = 0; var14 < var11; var14++) {
            int var13 = i.a(var7, var6, var14, var11);
            var0.setColor(i.a(var13, var6, var8, var9));
            var0.fillRect(var1, var12, var3, 1);
            var12++;
         }
      }

      if (var5 != 15) {
         boolean var22 = (var5 & 4) == 0;
         boolean var23 = (var5 & 8) == 0;
         boolean var24 = (var5 & 1) == 0;
         boolean var25 = (var5 & 2) == 0;
         int var15 = var3 / var10.p - 2;
         if (var3 % var10.p != 0) {
            var15++;
         }

         if (!var22) {
            var15++;
         }

         if (!var23) {
            var15++;
         }

         int var16 = var4 / var10.q - 2;
         if (var4 % var10.q != 0) {
            var16++;
         }

         if (!var24) {
            var16++;
         }

         if (!var25) {
            var16++;
         }

         int var17 = var1;
         if (var22) {
            var17 += var10.p;
         }

         int var18 = var2 + var4 - var10.q;

         for (int var19 = 0; var19 < var15; var19++) {
            if (var24) {
               var10.a(var0, 1, var17, var2, 0);
            }

            if (var25) {
               var10.a(var0, 6, var17, var18, 0);
            }

            var17 += var10.p;
         }

         int var26 = var2;
         if (var24) {
            var26 += var10.q;
         }

         int var20 = var1 + var3 - var10.p;

         for (int var21 = 0; var21 < var16; var21++) {
            if (var22) {
               var10.a(var0, 3, var1, var26, 0);
            }

            if (var23) {
               var10.a(var0, 4, var20, var26, 0);
            }

            var26 += var10.q;
         }

         if (var22 && var24) {
            var10.a(var0, 0, var1, var2, 0);
         }

         if (var23 && var24) {
            var10.a(var0, 2, var20, var2, 0);
         }

         if (var22 && var25) {
            var10.a(var0, 5, var1, var18, 0);
         }

         if (var23 && var25) {
            var10.a(var0, 7, var20, var18, 0);
         }
      }
   }
}
