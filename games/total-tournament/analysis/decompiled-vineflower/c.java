import javax.microedition.lcdui.Graphics;

public final class c {
   int a = 0;
   private int e;
   private byte f;
   private int g;
   e b;
   private int h;
   private int i;
   private int j;
   private a k;
   private int l;
   private int m;
   private int n;
   private int o;
   private int p;
   private int q;
   private int r;
   private int s;
   private int t;
   byte c;
   private int u;
   private int v;
   private int w;
   private int x;
   private int y;
   private int z;
   private boolean A;
   private String[] B;
   private int C;
   private int D;
   boolean d = false;
   private boolean E = true;
   private int F;
   private int G;
   private int H;
   private String I;
   private int J;
   private int K;
   private int L;
   private int M;
   private String[][] N;
   private int O;
   private int P;
   private int Q;
   private int R;
   private int S;

   public c(e var1, String[] var2) {
      this.k = new a();
      if (var2 != null) {
         this.B = new String[var2.length];
         this.z = var2.length;
      }

      this.I = "_";

      for (int var3 = 0; var3 < this.z; var3++) {
         this.B[var3] = new String(var2[var3]);
      }

      this.b = var1;
      if (this.b.K == 0) {
         this.z--;
      }

      this.J = (this.b.e >> 2) + (this.b.e >> 3);
      if (this.b.K == 4 || this.b.K == 19) {
         this.J = this.b.e >> 4;
         this.w = this.b.q.getHeight() + (this.b.q.getHeight() >> 2);
         this.z -= 2;
      }

      this.b.X = 0;
      this.A = false;
      this.d = true;
      if (this.b.K > 10 && this.b.K != 19 && this.b.K != 13 && this.b.K != 14) {
         this.d = false;
      }

      this.e = -this.J;
      this.f = 0;
      this.O = this.b.e / 13;
      this.l = this.b.h[3][33] + 2;
      this.m = this.b.l;
      this.P = this.b.m;
      this.n = this.m >> 1;
      this.o = this.m >> 3;
      this.p = this.m + this.o;
      this.G = 0;
      this.M = this.b.s.a();
      this.x = this.z;
      if (this.b.K != 11 && this.b.K != 12) {
         this.L = this.p;
         this.u = this.b.b - this.L;
         this.u = this.u - this.b.h[3][33];
         this.q = this.L * this.z >> 1;
      } else {
         this.L = this.M;
         this.u = this.b.b - (this.l << 1);
         this.q = this.L * this.z;
      }

      if (this.u < this.q << 1) {
         this.x = this.u / this.L;
         this.q = this.L * this.x >> 1;
      }

      if (this.b.K == 11 || this.b.K == 12) {
         if (this.b.b - (this.l << 1) > this.L * this.z) {
            this.x = this.z;
         } else {
            this.x--;
         }
      }

      if (this.b.K != 11 && this.b.K != 12 && this.x > 5) {
         this.x = 5;
         this.q = this.L * this.x >> 1;
      }

      this.Q = this.b.f;
      this.t = this.b.c;
      this.h = this.t - this.q;
      this.c = (byte)((this.l >> 1) - (this.M >> 1));
      if (this.b.K == 9) {
         this.x = this.z;
      }

      this.j = this.t - (this.x * this.M >> 1);
      this.S = this.Q - (this.Q >> 1) - this.P - (this.Q >> 3);
      this.R = this.Q + (this.Q >> 1) + (this.Q >> 3);
      if (this.b.K == 5 || this.b.K == 6 || this.b.K == 7 || this.b.K == 8 || this.b.K == 9 || this.b.K == 10) {
         this.c = 0;
         this.K = 1;
         this.g = this.K;
         this.D = 0;
         this.b.C = this.b.e / this.b.w.getWidth() + 1;
         this.J = this.b.e >> 4;
         this.e = -this.J;
         this.L = 22;
         this.x = this.z - 1;
         this.z = this.x;
         this.q = this.L * this.x;
         this.w = this.q;
         this.h = this.k.a() + this.m;
         this.y = this.h + (this.w >> 1);
         this.r = this.b.b - (this.h + this.q + (this.b.w.getHeight() >> 2) + this.b.h[3][33]);
         this.v = this.r / this.M;
         this.i = this.h + this.q + (this.b.w.getHeight() >> 2) + (this.r >> 1) - (this.v * this.M >> 1);
         this.v--;
         if (this.M << 1 >= this.r) {
            this.h = this.k.a();
            this.y = this.h + (this.w >> 1);
            this.E = false;
         }

         String[] var5 = this.b.a("text3");
         this.N = new String[var5.length][];

         for (int var7 = 0; var7 < var5.length; var7++) {
            var2 = this.b.a(var5[var7], this.b.e - (this.O << 1) - this.O);
            this.N[var7] = new String[var2.length];

            for (int var4 = 0; var4 < var2.length; var4++) {
               this.N[var7][var4] = new String(var2[var4]);
            }
         }

         if (this.b.K == 5) {
            this.z = this.B.length;
            this.J = this.b.e >> 2;
            this.L = this.p;
            this.u = (this.b.b >> 1) + (this.b.b >> 2) - this.L;
            this.q = this.L * this.z >> 1;
            if (this.u < this.q << 1) {
               this.x = this.u / this.L;
               this.q = this.L * this.x >> 1;
            }

            if (this.x > 5) {
               this.x = 5;
            }

            this.q = this.L * this.x >> 1;
            this.h = ((this.b.b >> 1) + (this.b.b >> 2) >> 1) - this.q;
            this.r = this.b.b - (this.h + this.L * (this.x - 1) + this.L + (this.b.p.getWidth() >> 1) + this.b.h[3][33]);
            this.v = this.r / this.M;
            this.i = this.h + this.L * (this.x - 1) + this.L + (this.b.p.getWidth() >> 1) + (this.r >> 1) - (this.v * this.M >> 1);
            this.v -= 2;
            this.E = true;
            if (this.M << 1 >= this.r) {
               this.E = false;
            }
         }
      }

      if (this.b.K == 20 || this.b.K == 22) {
         this.d = false;
         this.L = this.b.h[3][20] + (this.b.h[3][20] >> 1);
         this.z = this.b.ab.length;
         this.x = this.z;
         this.u = this.b.b - 21;
         this.u = this.u - this.b.h[3][33];
         if (this.u - this.L * this.z < 0) {
            this.x = this.u / this.L;
         }

         this.q = this.L * this.x;
         this.h = 22;
      }

      if (this.b.K == 1) {
         this.d = false;
      }
   }

   final void a(boolean var1) {
      if (this.b.K != 12) {
         if (!this.d) {
            this.c = -1;
            if (this.b.X < 1) {
               this.b.X = 2;
            }

            if (!var1) {
               return;
            }

            if (this.b.K > 5 && this.b.K < 11) {
               this.b.K = 5;
               return;
            }

            switch (this.b.K) {
               case 0:
                  this.b.j = !this.b.j;
                  break;
               case 1:
                  this.b.X = 0;
                  e.J = !e.J;
                  this.b.d = !this.b.d;
                  break;
               case 2:
                  this.b.K = 3;
                  break;
               case 3:
                  this.b.j = !this.b.j;
               case 4:
               case 6:
               case 7:
               case 8:
               case 9:
               case 10:
               case 13:
               case 15:
               case 16:
               case 17:
               case 18:
               case 19:
               case 21:
               default:
                  break;
               case 5:
                  this.b.K = 3;
                  break;
               case 11:
                  this.b.K = 3;
                  break;
               case 12:
                  this.b.K = 3;
                  break;
               case 14:
                  this.b.K = 3;
                  break;
               case 20:
                  this.b.K = 1;
                  break;
               case 22:
                  this.b.K = 3;
                  this.b.Q = true;
                  this.b.A = true;
            }

            if (this.b.K == 19) {
               this.b.q = null;
               this.b.r = null;
               this.b.K = 13;
            }

            if (this.b.K == 4) {
               this.b.q = null;
               this.b.r = null;
               this.b.K = 3;
            }

            if (this.b.K == 13) {
               this.b.K = (byte)(6 + this.b.t);
            }
         }
      }
   }

   private void a(Graphics var1, String var2) {
      int var3 = this.m >> 1;
      int var4 = this.S + this.P;
      var1.setColor(16711680);
      var1.fillRect(this.Q - (this.R - this.S + this.P >> 1) + 5, var3 - (this.m - 4 >> 1), this.R - this.S + this.P - 10, this.m - 4);
      var1.setClip(this.R, var3 - this.n, this.P, this.m);
      var1.drawImage(this.b.k, this.R - this.P, var3 - this.n, 20);
      var1.setClip(this.S, var3 - this.n, this.P, this.m);
      var1.drawImage(this.b.k, this.S, var3 - this.n, 20);
      var1.setClip(0, 0, this.b.e, this.b.b);
      this.k.a(var1, var2, this.Q - (this.k.a(var2) >> 1), var3 - (this.M >> 1) - 1, 20);
      var1.setColor(0);
      var1.drawLine(var4, var3 - this.n + 4, this.R, var3 - this.n + 4);
      var1.drawLine(var4, var3 + this.n - 4, this.R, var3 + this.n - 4);
      var1.drawLine(var4, var3 + this.n - 2, this.R, var3 + this.n - 2);
      var1.drawLine(var4, var3 - this.n + 2, this.R, var3 - this.n + 2);
      var1.setColor(12302336);
      var1.drawLine(var4, var3 + this.n - 3, this.R, var3 + this.n - 3);
      var1.drawLine(var4, var3 - this.n + 3, this.R, var3 - this.n + 3);
   }

   private void a(Graphics var1) {
      byte var2 = 32;
      if (this.c == -2) {
         var2 = 34;
      }

      this.b.a(var1, var2, 0, this.b.b - this.b.h[3][32]);
      var2 = 33;
      if (this.c == -1) {
         var2 = 35;
      }

      this.b.a(var1, var2, this.b.e - this.b.h[2][33], this.b.b - this.b.h[3][33]);
      if (this.b.X == 2) {
         this.b.X = 1;
      } else {
         if (this.b.X == 1) {
            this.b.X = 0;
            if (this.c == -1) {
               this.a(true);
            } else {
               this.b(true);
            }
         }

         this.c = 0;
      }
   }

   final void b(boolean var1) {
      if (!this.d) {
         this.c = -2;
         if (!var1) {
            if (this.b.X < 1) {
               this.b.X = 2;
            }

            return;
         }

         if (this.b.K > 5 && this.b.K < 11) {
            this.b.K = 13;
            if (this.b.t == 3) {
               this.b.N = 4;
               return;
            }

            this.b.N = 10;
            return;
         }

         switch (this.b.K) {
            case 0:
               switch (this.a) {
                  case 0:
                     this.b.K = 3;
                     e.c();
                     e.V = true;
                     return;
                  case 1:
                     this.b.K = 3;
                     e.f();
                     e.V = false;
                  default:
                     return;
               }
            case 1:
               switch (this.a) {
                  case 0:
                     e.J = !e.J;
                     this.b.d = !this.b.d;
                     return;
                  case 1:
                     this.b.e();
                     this.b.K = 20;
                     return;
                  case 2:
                     this.b.d();
                     e.J = !e.J;
                     this.b.d = !this.b.d;
                     return;
                  case 3:
                     e.V = !e.V;
                     this.b.A = true;
                     this.b.z = true;
                     return;
                  case 4:
                     if (++e.n > e.o) {
                        e.n = 0;
                     }

                     this.b.R = true;
                     e.J = !e.J;
                     this.b.K = 1;
                     this.b.A = true;
                     this.b.a(this.b.L ? 1 : 2);
                     this.b.C = this.b.e / this.b.w.getWidth() + 1;
                     this.b.S = false;
                     this.b.aa = 0;
                     return;
                  case 5:
                     this.b.K = 3;
                     this.b.Q = true;
                     this.b.A = true;
                     return;
                  case 6:
                     this.b.j = !this.b.j;
                  default:
                     return;
               }
            case 2:
               switch (this.a) {
                  case 0:
                     e.ac = !e.ac;
                     return;
                  case 1:
                     e.V = !e.V;
                     this.b.A = true;
                     this.b.z = true;
                     return;
                  case 2:
                     this.b.K = 3;
                  default:
                     return;
               }
            case 3:
               switch (this.a) {
                  case 0:
                     this.b.a = false;
                     this.b.K = 5;
                     return;
                  case 1:
                     this.b.K = 2;
                     return;
                  case 2:
                     this.b.K = 11;
                     return;
                  case 3:
                     this.b.K = 12;
                     this.b.i = "";
                     return;
                  case 4:
                     this.b.j = !this.b.j;
                  default:
                     return;
               }
            case 4:
               switch (this.a) {
                  case 0:
                     e.J = !e.J;
                     this.b.K = 1;
                     this.b.A = true;
                     this.b.L = true;
                     this.b.q = null;
                     this.b.r = null;
                     this.b.a(1);
                     return;
                  case 1:
                     e.J = !e.J;
                     this.b.K = 1;
                     this.b.A = true;
                     this.b.L = false;
                     this.b.q = null;
                     this.b.r = null;
                     this.b.a(2);
                     return;
                  case 2:
                     this.b.q = null;
                     this.b.r = null;
                     this.b.K = 3;
                  default:
                     return;
               }
            case 5:
               this.b.g[0] = this.b.I >> 1;
               this.b.g[1] = this.b.I >> 1;
               switch (this.a) {
                  case 0:
                     this.b.K = 6;
                     this.b.t = this.a;
                     this.b.t = 0;
                     break;
                  case 1:
                     this.b.K = 7;
                     this.b.t = this.a;
                     this.b.t = 1;
                     break;
                  case 2:
                     this.b.K = 8;
                     this.b.t = this.a;
                     this.b.t = 2;
                     break;
                  case 3:
                     this.b.K = 9;
                     this.b.t = this.a;
                     this.b.t = 3;
                     break;
                  case 4:
                     this.b.K = 10;
                     this.b.t = this.a;
                     this.b.t = 4;
                     break;
                  case 5:
                     this.b.K = 3;
                  default:
                     return;
               }
            case 6:
            case 7:
            case 8:
            case 9:
            case 10:
            case 15:
            case 16:
            case 17:
            case 18:
            case 23:
            case 24:
            default:
               break;
            case 11:
               this.b.K = 3;
               return;
            case 12:
               this.b.K = 3;
               return;
            case 13:
               if (this.a == this.z - 1) {
                  this.b.K = (byte)(6 + this.b.t);
                  return;
               }

               this.b.T = this.a;
               this.b.K = 19;
               this.b.b();
               this.b.C = this.b.e / this.b.w.getWidth() + 1;
               return;
            case 14:
               if (this.a != this.z - 1) {
                  this.b.T = this.a;
                  this.b.K = 4;
                  this.b.b();
                  this.b.C = this.b.e / this.b.w.getWidth() + 1;
                  return;
               }
            case 25:
               this.b.K = 3;
               break;
            case 19:
               switch (this.a) {
                  case 0:
                     e.J = !e.J;
                     this.b.K = 1;
                     this.b.A = true;
                     this.b.L = true;
                     this.b.q = null;
                     this.b.r = null;
                     this.b.a(1);
                     return;
                  case 1:
                     e.J = !e.J;
                     this.b.K = 1;
                     this.b.A = true;
                     this.b.L = false;
                     this.b.q = null;
                     this.b.r = null;
                     this.b.a(2);
                     return;
                  case 2:
                     this.b.q = null;
                     this.b.r = null;
                     this.b.K = 3;
                  default:
                     return;
               }
            case 20:
               this.b.K = 1;
               return;
            case 21:
               this.b.K = 3;
               this.b.Q = true;
               this.b.A = true;
               return;
            case 22:
               this.b.K = (byte)(6 + this.b.t);
               this.b.Q = true;
               this.b.A = true;
               return;
         }
      }
   }

   private void a(Graphics var1, byte var2, byte var3) {
      if (this.E) {
         int var4;
         int var5;
         if (var3 == 5) {
            var2 = (byte)(var2 + 7);
            var4 = this.r;
            var5 = this.h + this.L * (this.x - 1) + this.L + (this.b.p.getWidth() >> 1) + 3;
         } else {
            var4 = this.r;
            var5 = this.h + this.q + (this.b.w.getHeight() >> 2) + 3;
         }

         var1.setColor(8931840);
         var1.drawRect(this.O - 1, var5 - 2, this.b.e - (this.O << 1) + 1, var4 - 2);
         var1.setColor(1516032);
         var1.fillRect(this.O, var5 + 1 - 2, this.b.e - (this.O << 1), var4 - 1 - 2);
         var4 = this.D;
         if (this.D > this.v) {
            var4 = this.v;
         }

         if (this.D != this.N[var2].length) {
            this.k.a(var1, this.N[var2][this.D], 0, this.C, (this.O << 1) - (this.O >> 1), this.i + 3 + var4 * this.M, 20);
            this.k.a(var1, this.I, (this.O << 1) - (this.O >> 1) + this.k.a(this.N[var2][this.D], 0, this.C), this.i + 3 + var4 * this.M, 20);
         } else if (var3 == 5) {
            var4++;
         }

         for (int var6 = this.s; var6 < var4 + this.s; var6++) {
            this.k.a(var1, this.N[var2][var6], (this.O << 1) - (this.O >> 1), this.i + 3 + (var6 - this.s) * this.M, 20);
         }

         this.I = "_";
         this.g--;
         if (this.g == 0) {
            if (this.D == this.N[var2].length) {
               this.s = 0;
               this.D = 0;
            }

            this.g = this.K;
            this.C++;
            if (this.C == this.N[var2][this.D].length()) {
               this.I = "";
               this.C = 0;
               this.D++;
               this.g = this.K << 3;
               if (this.D == this.N[var2].length) {
                  this.g = this.K << 6;
                  return;
               }

               if (var4 == this.v) {
                  this.s++;
               }
            }
         }
      }
   }

   final void a() {
      if (!this.d) {
         this.A = true;
         if (this.b.K != 11 && this.b.K != 12 && this.b.K != 20 && this.b.K != 22) {
            this.a++;
            if (this.b.K == 5 || this.b.K == 6 || this.b.K == 7 || this.b.K == 8 || this.b.K == 9 || this.b.K == 10) {
               this.s = 0;
               this.D = 0;
               this.g = this.K;
               this.C = 0;
            }

            if (this.a == this.z) {
               this.a = 0;
               this.G = 0;
            }

            if (this.a > this.x + this.G - 1) {
               this.G++;
            }

            if ((this.b.K == 13 || this.b.K == 14) && this.a > this.b.N) {
               this.a = this.b.y;
               this.G = this.z - this.x;
            }

            return;
         }

         if (this.x + this.G < this.z) {
            this.G++;
         }
      }
   }

   final void b() {
      if (!this.d) {
         this.A = true;
         if (this.b.K != 11 && this.b.K != 12 && this.b.K != 20 && this.b.K != 22) {
            this.a--;
            if (this.b.K == 5 || this.b.K == 6 || this.b.K == 7 || this.b.K == 8 || this.b.K == 9 || this.b.K == 10) {
               this.s = 0;
               this.D = 0;
               this.g = this.K;
               this.C = 0;
            }

            if (this.a < 0) {
               this.a = this.z - 1;
               this.G = this.z - this.x;
               return;
            }

            if ((this.b.K == 13 || this.b.K == 14) && this.a > this.b.N) {
               this.a = this.b.N;
               this.G = this.a - this.x + 1 > 0 ? this.a - this.x + 1 : 0;
               return;
            }

            if (this.a < this.G) {
               this.G--;
            }

            return;
         }

         if (this.G > 0) {
            this.G--;
         }
      }
   }

   private void a(Graphics var1, int var2) {
      int var3 = (this.b.b >> 2) - (this.w >> 1) + (this.b.q.getHeight() >> 3);
      int var4 = (this.b.e >> 2) - (this.b.q.getWidth() >> 1);
      int var5 = this.b.e - (this.b.e >> 2) - (this.b.q.getWidth() >> 1);
      int var6 = var4;
      var1.setColor(1450496);
      var1.setClip(0, (this.b.c >> 1) - var2, this.b.e, var2 << 1);
      var1.fillRect(0, (this.b.c >> 1) - var2, this.b.e, var2 << 1);
      if (this.a == 1) {
         var6 = var5;
      }

      var1.setColor(4478976);
      var1.fillRect(var6 - 9, var3 - 4, this.b.q.getWidth() + 18, this.b.q.getHeight() + 8);
      var1.setColor(5599744);
      var1.fillRect(var6 - 3, var3 - 3, this.b.q.getWidth() + 6, this.b.q.getHeight() + 6);
      var1.setColor(9807360);
      if (this.a == 1) {
         var1.setColor(15857920);
      }

      var1.drawRect(var5 - 1, var3 - 1, this.b.r.getWidth() + 1, this.b.r.getHeight() + 1);
      var1.setColor(7702016);
      if (this.a == 0) {
         var1.setColor(15857920);
      }

      var1.drawRect(var4 - 1, var3 - 1, this.b.q.getWidth() + 1, this.b.q.getHeight() + 1);
      var1.drawImage(this.b.q, var4, var3, 20);
      var1.drawImage(this.b.r, var5, var3, 20);
   }

   private void a(Graphics var1, int var2, int var3, int var4) {
      int var6 = 0;
      var6 = var3 + var4;
      var1.setClip(0, var6, this.b.e, this.b.w.getHeight() >> 2);
      var6 -= this.b.w.getHeight() - (this.b.w.getHeight() >> 2);

      for (int var5 = 0; var5 < this.b.C; var5++) {
         var1.drawImage(this.b.w, var5 * this.b.w.getWidth(), var6 + 1, 20);
      }

      var6 = var3 - (this.b.w.getHeight() >> 2) - var4;
      var1.setClip(0, var6, this.b.e, this.b.w.getHeight() >> 2);
      var6 -= this.b.w.getHeight() >> 1;

      for (int var11 = 0; var11 < this.b.C; var11++) {
         var1.drawImage(this.b.w, var11 * this.b.w.getWidth(), var6, 20);
      }

      var1.setClip(0, 0, this.b.e, this.b.b);
   }

   final void a(Graphics var1, byte var2) {
      var1.setColor(0);
      if (var2 != 21 && var2 != 1) {
         var1.fillRect(0, 0, this.b.e, this.b.b);
      }

      if (var2 == 21 && this.b.B != null) {
         var1.setColor(0);
         var1.fillRect(0, 0, this.b.e, this.b.b);
         var1.setColor(16777215);
         var1.drawImage(this.b.B, (this.b.e >> 1) - (this.b.B.getWidth() >> 1), (this.b.b >> 1) - (this.b.B.getHeight() >> 1), 20);
         this.b.B = null;
      }

      if (var2 != 11 && var2 != 12) {
         if (this.d) {
            this.e = this.e + this.J;
            if (var2 != 4 && var2 != 6 && var2 != 7 && var2 != 8 && var2 != 9 && var2 != 10 && var2 != 19 && this.Q + this.e > this.R) {
               this.e = -this.J;
               this.f++;
               if (this.f == this.x) {
                  this.d = !this.d;
                  if (var2 == 5) {
                     this.b.W = 35;
                  }
               }
            } else {
               int var25 = this.h + (this.f - this.G) * this.L + (this.L >> 1);
               if (var2 == 4 || var2 == 19) {
                  if (this.J + this.e > this.w) {
                     this.d = !this.d;
                  }

                  this.a(var1, this.e >> 1);
                  this.a(var1, 0, this.b.b >> 2, this.e >> 1);
                  return;
               }

               if (var2 == 6 || var2 == 7 || var2 == 8 || var2 == 9 || var2 == 10) {
                  if (this.J + this.e > this.w) {
                     this.d = !this.d;
                     this.b.W = 35;
                  }

                  var1.setColor(1516032);
                  var1.fillRect(0, this.y - (this.e >> 1), this.b.e, this.e);

                  for (int var37 = 0; var37 < this.x; var37++) {
                     var1.setClip(0, this.y - (this.e >> 1), this.b.e, this.e);
                     var1.setColor(2967296);
                     var1.fillRect(2, this.h + var37 * this.L + (this.L >> 1) - (this.b.h[3][27] - 4 >> 1), this.b.e - 4, this.b.h[3][27] - 4);
                  }

                  var1.setColor(0);
                  var1.fillRect(0, 0, this.b.e, this.y - (this.e >> 1));
                  var1.fillRect(0, this.y + (this.e >> 1), this.b.e, this.b.b - this.y - (this.e >> 1));
                  this.a(var1, 0, this.y, this.e >> 1);
                  return;
               }

               int var28 = this.Q - this.e;
               var1.setColor(2967296);
               var1.fillRect(this.Q - this.e - this.P + 1, var25 - (this.m - 4 >> 1), (this.e + this.P << 1) - 2, this.m - 4);
               var1.setClip(this.Q - this.e - this.P, var25 - this.n, this.P, this.m);
               var1.drawImage(this.b.k, this.Q - this.e - this.P, var25 - this.n, 20);
               var1.setClip(this.Q + this.e, var25 - this.n, this.P, this.m);
               var1.drawImage(this.b.k, this.Q + this.e - this.P, var25 - this.n, 20);
               var1.setClip(0, 0, this.b.e, this.b.b);
               var1.setColor(0);
               var1.drawLine(var28, var25 - this.n + 4, this.Q + this.e, var25 - this.n + 4);
               var1.drawLine(var28, var25 + this.n - 4, this.Q + this.e, var25 + this.n - 4);
               var1.drawLine(var28, var25 + this.n - 2, this.Q + this.e, var25 + this.n - 2);
               var1.drawLine(var28, var25 - this.n + 2, this.Q + this.e, var25 - this.n + 2);
               var1.setColor(12302336);
               var1.drawLine(var28, var25 + this.n - 3, this.Q + this.e, var25 + this.n - 3);
               var1.drawLine(var28, var25 - this.n + 3, this.Q + this.e, var25 - this.n + 3);
            }

            for (int var38 = 0; var38 < this.f; var38++) {
               int var26 = this.h + (var38 - this.G) * this.L + (this.L >> 1);
               if (var2 == 4 || var2 == 19) {
                  var26 = (this.b.b >> 1) - (this.L >> 1) + (this.b.b >> 2);
                  this.a(var1, this.e >> 1);
                  this.a(var1, 0, this.b.b >> 2, this.e >> 1);
               }

               int var29 = this.S + this.P;
               var1.setColor(2967296);
               var1.fillRect(this.Q - (this.R - this.S + this.P >> 1) + 5, var26 - (this.m - 4 >> 1), this.R - this.S + this.P - 10, this.m - 4);
               var1.setClip(this.R, var26 - this.n, this.P, this.m);
               var1.drawImage(this.b.k, this.R - this.P, var26 - this.n, 20);
               var1.setClip(this.S, var26 - this.n, this.P, this.m);
               var1.drawImage(this.b.k, this.S, var26 - this.n, 20);
               var1.setClip(0, 0, this.b.e, this.b.b);
               var1.setColor(0);
               var1.drawLine(var29, var26 - this.n + 4, this.R, var26 - this.n + 4);
               var1.drawLine(var29, var26 + this.n - 4, this.R, var26 + this.n - 4);
               var1.drawLine(var29, var26 + this.n - 2, this.R, var26 + this.n - 2);
               var1.drawLine(var29, var26 - this.n + 2, this.R, var26 - this.n + 2);
               var1.setColor(12302336);
               var1.drawLine(var29, var26 + this.n - 3, this.R, var26 + this.n - 3);
               var1.drawLine(var29, var26 - this.n + 3, this.R, var26 - this.n + 3);
               this.k.a(var1, this.B[var38], this.Q - (this.k.a(this.B[var38]) >> 1), var26 - (this.M >> 1) - 1, 20);
            }
         } else if (var2 != 20 && var2 != 22) {
            if (this.B != null) {
               if (var2 != 6 && var2 != 7) {
                  if (var2 == 8) {
                     int var36 = (this.b.h[2][27] << 1) + (this.b.h[2][27] >> 1) + (this.b.h[2][38] << 1);
                     this.a(var1, 0, this.y, this.w >> 1);
                     var1.setColor(1516032);
                     var1.fillRect(0, this.h, this.b.e, this.q);

                     for (int var44 = 0; var44 < this.x; var44++) {
                        int var22 = this.h + var44 * this.L + (this.L >> 1);
                        if (this.a != var44) {
                           var1.setColor(2967296);
                           var1.fillRect(2, this.h + var44 * this.L + (this.L >> 1) - (this.b.h[3][27] - 4 >> 1), this.b.e - 4, this.b.h[3][27] - 4);
                           var1.setColor(2967296);
                           var1.drawRect(this.b.e - var36 - 1, var22 - (this.b.h[3][27] >> 1) - 1, this.b.h[2][27] + 1, this.b.h[3][27] + 1);
                           this.b.a(var1, var44 == 0 ? 30 : var44 + 27, this.b.e - var36, var22 - (this.b.h[3][27] >> 1));
                           if (var44 == 3) {
                              this.b.a(var1, 40, this.b.e - var36, var22 - (this.b.h[3][27] >> 1));
                           }

                           this.k.a(var1, this.B[var44], this.O, this.h + var44 * this.L + (this.L >> 1) - (this.M >> 1), 20);
                           switch (var44) {
                              case 0:
                                 this.k
                                    .a(
                                       var1,
                                       "" + this.b.D,
                                       this.b.e - (this.b.h[2][27] >> 1) - (this.b.h[2][27] >> 2) - (this.k.a("" + this.b.D) >> 1) - this.b.h[2][38],
                                       this.h + var44 * this.L + (this.L >> 1) - (this.M >> 1),
                                       20
                                    );
                                 break;
                              case 1:
                                 this.k
                                    .a(
                                       var1,
                                       "" + this.b.H,
                                       this.b.e - (this.b.h[2][27] >> 1) - (this.b.h[2][27] >> 2) - (this.k.a("" + this.b.H) >> 1) - this.b.h[2][38],
                                       this.h + var44 * this.L + (this.L >> 1) - (this.M >> 1),
                                       20
                                    );
                                 break;
                              case 2:
                                 this.k
                                    .a(
                                       var1,
                                       "" + this.b.I,
                                       this.b.e - (this.b.h[2][27] >> 1) - (this.b.h[2][27] >> 2) - (this.k.a("" + this.b.I) >> 1) - this.b.h[2][38],
                                       this.h + var44 * this.L + (this.L >> 1) - (this.M >> 1),
                                       20
                                    );
                                 break;
                              case 3:
                                 this.k
                                    .a(
                                       var1,
                                       this.b.g[0] + ":" + this.b.g[1],
                                       this.b.e
                                          + (this.b.g[1] == this.b.g[0] ? 1 : 0)
                                          - (this.b.h[2][27] >> 2)
                                          - (this.b.h[2][27] >> 1)
                                          - (this.k.a(this.b.g[0] + ":" + this.b.g[1]) >> 1)
                                          - this.b.h[2][38],
                                       this.h + var44 * this.L + (this.L >> 1) - (this.M >> 1),
                                       20
                                    );
                           }
                        }
                     }

                     var1.setColor(4286208);
                     var1.fillRect(2, this.h + this.a * this.L + (this.L >> 1) - (this.b.h[3][27] - 4 >> 1), this.b.e - 4, this.b.h[3][27] - 4);
                     var1.setColor(12171264);
                     var1.drawRect(1, this.h + this.a * this.L + (this.L >> 1) - (this.b.h[3][27] - 4 >> 1) - 1, this.b.e - 3, this.b.h[3][27] - 3);
                     var1.drawRect(
                        this.b.e - var36 - 1, this.h + this.a * this.L + (this.L >> 1) - (this.b.h[3][27] >> 1) - 1, this.b.h[2][27] + 1, this.b.h[3][27] + 1
                     );
                     this.b.a(var1, this.a == 0 ? 30 : 27 + this.a, this.b.e - var36, this.h + this.a * this.L + (this.L >> 1) - (this.b.h[3][27] >> 1));
                     if (this.a == 3) {
                        this.b.a(var1, 40, this.b.e - var36, this.h + this.a * this.L + (this.L >> 1) - (this.b.h[3][27] >> 1));
                     }

                     byte var23 = 38;
                     if (this.c == 2) {
                        var23 = 37;
                     }

                     this.b
                        .a(
                           var1,
                           var23,
                           this.b.e - var36 - this.b.h[2][38] - (this.b.h[2][38] >> 1),
                           this.h + this.a * this.L + (this.L >> 1) - (this.b.h[3][38] >> 1)
                        );
                     var23 = 36;
                     if (this.c == 1) {
                        var23 = 39;
                     }

                     this.b
                        .a(
                           var1,
                           var23,
                           this.b.e - this.b.h[2][27] + (this.b.h[2][38] >> 1) - (this.b.h[2][27] >> 1) - (this.b.h[2][38] << 1),
                           this.h + this.a * this.L + (this.L >> 1) - (this.b.h[3][36] >> 1)
                        );
                     this.k.a(var1, this.B[this.a], this.O, this.h + this.a * this.L + (this.L >> 1) - (this.M >> 1), 20);
                     switch (this.a) {
                        case 0:
                           this.k
                              .a(
                                 var1,
                                 "" + this.b.D,
                                 this.b.e - (this.b.h[2][27] >> 2) - (this.b.h[2][27] >> 1) - (this.k.a("" + this.b.D) >> 1) - this.b.h[2][38],
                                 this.h + this.a * this.L + (this.L >> 1) - (this.M >> 1),
                                 20
                              );
                           break;
                        case 1:
                           this.k
                              .a(
                                 var1,
                                 "" + this.b.H,
                                 this.b.e - (this.b.h[2][27] >> 2) - (this.b.h[2][27] >> 1) - (this.k.a("" + this.b.H) >> 1) - this.b.h[2][38],
                                 this.h + this.a * this.L + (this.L >> 1) - (this.M >> 1),
                                 20
                              );
                           break;
                        case 2:
                           this.k
                              .a(
                                 var1,
                                 "" + this.b.I,
                                 this.b.e - (this.b.h[2][27] >> 2) - (this.b.h[2][27] >> 1) - (this.k.a("" + this.b.I) >> 1) - this.b.h[2][38],
                                 this.h + this.a * this.L + (this.L >> 1) - (this.M >> 1),
                                 20
                              );
                           break;
                        case 3:
                           this.k
                              .a(
                                 var1,
                                 this.b.g[0] + ":" + this.b.g[1],
                                 this.b.e
                                    + (this.b.g[1] == this.b.g[0] ? 1 : 0)
                                    - (this.b.h[2][27] >> 2)
                                    - (this.b.h[2][27] >> 1)
                                    - (this.k.a(this.b.g[0] + ":" + this.b.g[1]) >> 1)
                                    - this.b.h[2][38],
                                 this.h + this.a * this.L + (this.L >> 1) - (this.M >> 1),
                                 20
                              );
                     }

                     this.a(var1, (byte)(this.a == 0 ? 5 : this.a), var2);
                     this.a(var1);
                     if (this.E) {
                        this.a(var1, this.B[this.z]);
                     }
                  } else if (var2 == 9) {
                     int var35 = (this.b.h[2][27] << 1) + (this.b.h[2][27] >> 1) + (this.b.h[2][38] << 1);
                     this.a(var1, 0, this.y, this.w >> 1);
                     var1.setColor(1516032);
                     var1.fillRect(0, this.h, this.b.e, this.q);

                     for (int var43 = 0; var43 < this.x; var43++) {
                        int var19 = this.h + var43 * this.L + (this.L >> 1);
                        if (this.a != var43) {
                           var1.setColor(2967296);
                           var1.fillRect(2, this.h + var43 * this.L + (this.L >> 1) - (this.b.h[3][27] - 4 >> 1), this.b.e - 4, this.b.h[3][27] - 4);
                           var1.setColor(2967296);
                           var1.drawRect(this.b.e - var35 - 1, var19 - (this.b.h[3][27] >> 1) - 1, this.b.h[2][27] + 1, this.b.h[3][27] + 1);
                           this.b.a(var1, var43 == 0 ? 31 : var43 + 27, this.b.e - var35, var19 - (this.b.h[3][27] >> 1));
                           if (var43 == 3) {
                              this.b.a(var1, 40, this.b.e - var35, var19 - (this.b.h[3][27] >> 1));
                           }

                           this.k.a(var1, this.B[var43], this.O, this.h + var43 * this.L + (this.L >> 1) - (this.M >> 1), 20);
                           switch (var43) {
                              case 0:
                                 this.k
                                    .a(
                                       var1,
                                       "" + this.b.E,
                                       this.b.e - (this.b.h[2][27] >> 2) - (this.b.h[2][27] >> 1) - (this.k.a("" + this.b.E) >> 1) - this.b.h[2][38],
                                       this.h + var43 * this.L + (this.L >> 1) - (this.M >> 1),
                                       20
                                    );
                                 break;
                              case 1:
                                 this.k
                                    .a(
                                       var1,
                                       "" + this.b.H,
                                       this.b.e - (this.b.h[2][27] >> 2) - (this.b.h[2][27] >> 1) - (this.k.a("" + this.b.H) >> 1) - this.b.h[2][38],
                                       this.h + var43 * this.L + (this.L >> 1) - (this.M >> 1),
                                       20
                                    );
                                 break;
                              case 2:
                                 this.k
                                    .a(
                                       var1,
                                       "" + this.b.I,
                                       this.b.e - (this.b.h[2][27] >> 2) - (this.b.h[2][27] >> 1) - (this.k.a("" + this.b.I) >> 1) - this.b.h[2][38],
                                       this.h + var43 * this.L + (this.L >> 1) - (this.M >> 1),
                                       20
                                    );
                                 break;
                              case 3:
                                 this.k
                                    .a(
                                       var1,
                                       this.b.g[0] + ":" + this.b.g[1],
                                       this.b.e
                                          + (this.b.g[1] == this.b.g[0] ? 1 : 0)
                                          - (this.b.h[2][27] >> 2)
                                          - (this.b.h[2][27] >> 1)
                                          - (this.k.a(this.b.g[0] + ":" + this.b.g[1]) >> 1)
                                          - this.b.h[2][38],
                                       this.h + var43 * this.L + (this.L >> 1) - (this.M >> 1),
                                       20
                                    );
                           }
                        }
                     }

                     var1.setColor(4286208);
                     var1.fillRect(2, this.h + this.a * this.L + (this.L >> 1) - (this.b.h[3][27] - 4 >> 1), this.b.e - 4, this.b.h[3][27] - 4);
                     var1.setColor(12171264);
                     var1.drawRect(1, this.h + this.a * this.L + (this.L >> 1) - (this.b.h[3][27] - 4 >> 1) - 1, this.b.e - 3, this.b.h[3][27] - 3);
                     var1.drawRect(
                        this.b.e - var35 - 1, this.h + this.a * this.L + (this.L >> 1) - (this.b.h[3][27] >> 1) - 1, this.b.h[2][27] + 1, this.b.h[3][27] + 1
                     );
                     this.b.a(var1, this.a == 0 ? 31 : 27 + this.a, this.b.e - var35, this.h + this.a * this.L + (this.L >> 1) - (this.b.h[3][27] >> 1));
                     if (this.a == 3) {
                        this.b.a(var1, 40, this.b.e - var35, this.h + this.a * this.L + (this.L >> 1) - (this.b.h[3][27] >> 1));
                     }

                     byte var20 = 38;
                     if (this.c == 2) {
                        var20 = 37;
                     }

                     this.b
                        .a(
                           var1,
                           var20,
                           this.b.e - var35 - this.b.h[2][38] - (this.b.h[2][38] >> 1),
                           this.h + this.a * this.L + (this.L >> 1) - (this.b.h[3][38] >> 1)
                        );
                     var20 = 36;
                     if (this.c == 1) {
                        var20 = 39;
                     }

                     this.b
                        .a(
                           var1,
                           var20,
                           this.b.e - this.b.h[2][27] + (this.b.h[2][38] >> 1) - (this.b.h[2][27] >> 1) - (this.b.h[2][38] << 1),
                           this.h + this.a * this.L + (this.L >> 1) - (this.b.h[3][36] >> 1)
                        );
                     this.k.a(var1, this.B[this.a], this.O, this.h + this.a * this.L + (this.L >> 1) - (this.M >> 1), 20);
                     switch (this.a) {
                        case 0:
                           this.k
                              .a(
                                 var1,
                                 "" + this.b.E,
                                 this.b.e - (this.b.h[2][27] >> 2) - (this.b.h[2][27] >> 1) - (this.k.a("" + this.b.E) >> 1) - this.b.h[2][38],
                                 this.h + this.a * this.L + (this.L >> 1) - (this.M >> 1),
                                 20
                              );
                           break;
                        case 1:
                           this.k
                              .a(
                                 var1,
                                 "" + this.b.H,
                                 this.b.e - (this.b.h[2][27] >> 2) - (this.b.h[2][27] >> 1) - (this.k.a("" + this.b.H) >> 1) - this.b.h[2][38],
                                 this.h + this.a * this.L + (this.L >> 1) - (this.M >> 1),
                                 20
                              );
                           break;
                        case 2:
                           this.k
                              .a(
                                 var1,
                                 "" + this.b.I,
                                 this.b.e - (this.b.h[2][27] >> 2) - (this.b.h[2][27] >> 1) - (this.k.a("" + this.b.I) >> 1) - this.b.h[2][38],
                                 this.h + this.a * this.L + (this.L >> 1) - (this.M >> 1),
                                 20
                              );
                           break;
                        case 3:
                           this.k
                              .a(
                                 var1,
                                 this.b.g[0] + ":" + this.b.g[1],
                                 this.b.e
                                    + (this.b.g[1] == this.b.g[0] ? 1 : 0)
                                    - (this.b.h[2][27] >> 2)
                                    - (this.b.h[2][27] >> 1)
                                    - (this.k.a(this.b.g[0] + ":" + this.b.g[1]) >> 1),
                                 this.h + this.a * this.L + (this.L >> 1) - (this.M >> 1),
                                 20
                              );
                     }

                     this.a(var1, (byte)(this.a == 0 ? 4 : this.a), var2);
                     this.a(var1);
                     if (this.E) {
                        this.a(var1, this.B[this.z]);
                     }
                  } else if (var2 == 10) {
                     int var34 = (this.b.h[2][27] << 1) + (this.b.h[2][27] >> 1) + (this.b.h[2][38] << 1);
                     this.a(var1, 0, this.y, this.w >> 1);
                     var1.setColor(1516032);
                     var1.fillRect(0, this.h, this.b.e, this.q);

                     for (int var42 = 0; var42 < this.x; var42++) {
                        int var16 = this.h + var42 * this.L + (this.L >> 1);
                        if (this.a != var42) {
                           var1.setColor(2967296);
                           var1.fillRect(2, this.h + var42 * this.L + (this.L >> 1) - (this.b.h[3][27] - 4 >> 1), this.b.e - 4, this.b.h[3][27] - 4);
                           var1.setColor(2967296);
                           var1.drawRect(this.b.e - var34 - 1, var16 - (this.b.h[3][27] >> 1) - 1, this.b.h[2][27] + 1, this.b.h[3][27] + 1);
                           this.b.a(var1, var42 == 3 ? 40 : var42 + 27, this.b.e - var34, var16 - (this.b.h[3][27] >> 1));
                           this.k.a(var1, this.B[var42], this.O, this.h + var42 * this.L + (this.L >> 1) - (this.M >> 1), 20);
                           switch (var42) {
                              case 0:
                                 this.k
                                    .a(
                                       var1,
                                       "" + this.b.G,
                                       this.b.e - (this.b.h[2][27] >> 2) - (this.b.h[2][27] >> 1) - (this.k.a("" + this.b.G) >> 1) - this.b.h[2][38],
                                       this.h + var42 * this.L + (this.L >> 1) - (this.M >> 1),
                                       20
                                    );
                                 break;
                              case 1:
                                 this.k
                                    .a(
                                       var1,
                                       "" + this.b.H,
                                       this.b.e - (this.b.h[2][27] >> 2) - (this.b.h[2][27] >> 1) - (this.k.a("" + this.b.H) >> 1) - this.b.h[2][38],
                                       this.h + var42 * this.L + (this.L >> 1) - (this.M >> 1),
                                       20
                                    );
                                 break;
                              case 2:
                                 this.k
                                    .a(
                                       var1,
                                       "" + this.b.I,
                                       this.b.e - (this.b.h[2][27] >> 2) - (this.b.h[2][27] >> 1) - (this.k.a("" + this.b.I) >> 1) - this.b.h[2][38],
                                       this.h + var42 * this.L + (this.L >> 1) - (this.M >> 1),
                                       20
                                    );
                                 break;
                              case 3:
                                 this.k
                                    .a(
                                       var1,
                                       this.b.g[0] + ":" + this.b.g[1],
                                       this.b.e
                                          + (this.b.g[1] == this.b.g[0] ? 1 : 0)
                                          - (this.b.h[2][27] >> 2)
                                          - (this.b.h[2][27] >> 1)
                                          - (this.k.a(this.b.g[0] + ":" + this.b.g[1]) >> 1)
                                          - this.b.h[2][38],
                                       this.h + var42 * this.L + (this.L >> 1) - (this.M >> 1),
                                       20
                                    );
                           }
                        }
                     }

                     var1.setColor(4286208);
                     var1.fillRect(2, this.h + this.a * this.L + (this.L >> 1) - (this.b.h[3][27] - 4 >> 1), this.b.e - 4, this.b.h[3][27] - 4);
                     var1.setColor(12171264);
                     var1.drawRect(1, this.h + this.a * this.L + (this.L >> 1) - (this.b.h[3][27] - 4 >> 1) - 1, this.b.e - 3, this.b.h[3][27] - 3);
                     var1.drawRect(
                        this.b.e - var34 - 1, this.h + this.a * this.L + (this.L >> 1) - (this.b.h[3][27] >> 1) - 1, this.b.h[2][27] + 1, this.b.h[3][27] + 1
                     );
                     this.b.a(var1, this.a == 3 ? 40 : 27 + this.a, this.b.e - var34, this.h + this.a * this.L + (this.L >> 1) - (this.b.h[3][27] >> 1));
                     byte var17 = 38;
                     if (this.c == 2) {
                        var17 = 37;
                     }

                     this.b
                        .a(
                           var1,
                           var17,
                           this.b.e - var34 - this.b.h[2][38] - (this.b.h[2][38] >> 1),
                           this.h + this.a * this.L + (this.L >> 1) - (this.b.h[3][38] >> 1)
                        );
                     var17 = 36;
                     if (this.c == 1) {
                        var17 = 39;
                     }

                     this.b
                        .a(
                           var1,
                           var17,
                           this.b.e - this.b.h[2][27] + (this.b.h[2][38] >> 1) - (this.b.h[2][38] << 1) - (this.b.h[2][27] >> 1),
                           this.h + this.a * this.L + (this.L >> 1) - (this.b.h[3][36] >> 1)
                        );
                     this.k.a(var1, this.B[this.a], this.O, this.h + this.a * this.L + (this.L >> 1) - (this.M >> 1), 20);
                     switch (this.a) {
                        case 0:
                           this.k
                              .a(
                                 var1,
                                 "" + this.b.G,
                                 this.b.e - (this.b.h[2][27] >> 2) - (this.b.h[2][27] >> 1) - (this.k.a("" + this.b.G) >> 1) - this.b.h[2][38],
                                 this.h + this.a * this.L + (this.L >> 1) - (this.M >> 1),
                                 20
                              );
                           break;
                        case 1:
                           this.k
                              .a(
                                 var1,
                                 "" + this.b.H,
                                 this.b.e - (this.b.h[2][27] >> 2) - (this.b.h[2][27] >> 1) - (this.k.a("" + this.b.H) >> 1) - this.b.h[2][38],
                                 this.h + this.a * this.L + (this.L >> 1) - (this.M >> 1),
                                 20
                              );
                           break;
                        case 2:
                           this.k
                              .a(
                                 var1,
                                 "" + this.b.I,
                                 this.b.e - (this.b.h[2][27] >> 2) - (this.b.h[2][27] >> 1) - (this.k.a("" + this.b.I) >> 1) - this.b.h[2][38],
                                 this.h + this.a * this.L + (this.L >> 1) - (this.M >> 1),
                                 20
                              );
                           break;
                        case 3:
                           this.k
                              .a(
                                 var1,
                                 this.b.g[0] + ":" + this.b.g[1],
                                 this.b.e
                                    + (this.b.g[1] == this.b.g[0] ? 1 : 0)
                                    - (this.b.h[2][27] >> 2)
                                    - (this.b.h[2][27] >> 1)
                                    - (this.k.a(this.b.g[0] + ":" + this.b.g[1]) >> 1)
                                    - this.b.h[2][38],
                                 this.h + this.a * this.L + (this.L >> 1) - (this.M >> 1),
                                 20
                              );
                     }

                     this.a(var1, (byte)(this.a == 0 ? 6 : this.a), var2);
                     this.a(var1);
                     if (this.E) {
                        this.a(var1, this.B[this.z]);
                     }
                  } else if (var2 != 4 && var2 != 19) {
                     if (var2 == 0) {
                        this.k.a(var1, this.B[this.z], this.Q - (this.k.a(this.B[this.z]) >> 1), (this.b.b >> 3) - (this.M >> 1), 20);
                     }

                     for (int var33 = this.G; var33 < this.x + this.G; var33++) {
                        int var15 = this.h + (var33 - this.G) * this.L + (this.L >> 1);
                        int var27 = this.S + this.P;
                        int var30;
                        int var31;
                        if (this.a == var33) {
                           var1.setColor(13303808);
                           var30 = this.P >> 2;
                           var31 = this.M >> 2;
                        } else {
                           var1.setColor(2967296);
                           var30 = 0;
                           var31 = 0;
                        }

                        if ((var2 == 13 || var2 == 14) && var33 != this.z - 1 && var33 > this.b.N) {
                           var1.setColor(7108187);
                        }

                        var1.fillRect(
                           this.Q - (this.R - this.S + this.P >> 1) + 5 - var30,
                           var15 - (this.m - 4 >> 1),
                           this.R - this.S + this.P - 10 + (var30 << 1),
                           this.m - 4
                        );
                        var1.setClip(this.R + var30, var15 - this.n, this.P, this.m);
                        var1.drawImage(this.b.k, this.R + var30 - this.P, var15 - this.n, 20);
                        var1.setClip(this.S - var30, var15 - this.n, this.P, this.m);
                        var1.drawImage(this.b.k, this.S - var30, var15 - this.n, 20);
                        var1.setClip(0, 0, this.b.e, this.b.b);
                        String var41 = this.B[var33];
                        switch (var2) {
                           case 1:
                              if (var33 == 3) {
                                 if (e.V) {
                                    var41 = var41 + this.b.Z[1];
                                 } else {
                                    var41 = var41 + this.b.Z[0];
                                 }
                              }

                              if (var33 == 4) {
                                 var41 = var41 + e.n;
                              }

                              this.k.a(var1, var41, this.Q - (this.k.a(var41) >> 1), var15 - (this.M >> 1) + var31 - 1, 20);
                              break;
                           case 2:
                              if (var33 == 0) {
                                 if (e.ac) {
                                    var41 = var41 + this.b.Z[1];
                                 } else {
                                    var41 = var41 + this.b.Z[0];
                                 }
                              }

                              if (var33 == 1) {
                                 if (e.V) {
                                    var41 = var41 + this.b.Z[1];
                                 } else {
                                    var41 = var41 + this.b.Z[0];
                                 }
                              }

                              this.k.a(var1, var41, this.Q - (this.k.a(var41) >> 1), var15 - (this.M >> 1) + var31 - 1, 20);
                              break;
                           default:
                              this.k.a(var1, this.B[var33], this.Q - (this.k.a(this.B[var33]) >> 1), var15 - (this.M >> 1) + var31 - 1, 20);
                        }

                        var1.setColor(0);
                        var1.drawLine(var27 - var30, var15 - this.n + 4, this.R + (var30 << 1), var15 - this.n + 4);
                        var1.drawLine(var27 - var30, var15 + this.n - 4, this.R + (var30 << 1), var15 + this.n - 4);
                        var1.drawLine(var27 - var30, var15 + this.n - 2, this.R + (var30 << 1), var15 + this.n - 2);
                        var1.drawLine(var27 - var30, var15 - this.n + 2, this.R + (var30 << 1), var15 - this.n + 2);
                        var1.setColor(12302336);
                        var1.drawLine(var27 - var30, var15 + this.n - 3, this.R + (var30 << 1), var15 + this.n - 3);
                        var1.drawLine(var27 - var30, var15 - this.n + 3, this.R + (var30 << 1), var15 - this.n + 3);
                     }

                     var1.setColor(16777215);
                     if (this.x + this.G < this.z) {
                        var1.setClip(
                           this.Q - (this.b.p.getWidth() >> 1), this.h + this.L * (this.x - 1) + this.L, this.b.p.getWidth(), this.b.p.getHeight() >> 1
                        );
                        var1.drawImage(this.b.p, this.Q - (this.b.p.getWidth() >> 1), this.h + this.L * (this.x - 1) + this.L - (this.b.p.getHeight() >> 1), 20);
                     }

                     if (this.G > 0) {
                        var1.setClip(this.Q - (this.b.p.getWidth() >> 1), this.h - (this.b.p.getHeight() >> 1), this.b.p.getWidth(), this.b.p.getHeight() >> 1);
                        var1.drawImage(this.b.p, this.Q - (this.b.p.getWidth() >> 1), this.h - (this.b.p.getHeight() >> 1), 20);
                     }

                     this.a(var1);
                     if (var2 == 5) {
                        this.a(var1, (byte)this.a, var2);
                     }
                  } else {
                     int var14 = (this.b.b >> 1) - (this.L >> 1) + (this.b.b >> 2);
                     int var4 = this.S + this.P;
                     if (this.a == 0) {
                        var1.setColor(16711680);
                     } else {
                        var1.setColor(255);
                     }

                     boolean var5 = false;
                     boolean var6 = false;
                     var1.fillRect(this.Q - (this.R - this.S + this.P >> 1) + 5, var14 - (this.m - 4 >> 1), this.R - this.S + this.P - 10, this.m - 4);
                     var1.setClip(this.R, var14 - this.n, this.P, this.m);
                     var1.drawImage(this.b.k, this.R - this.P, var14 - this.n, 20);
                     var1.setClip(this.S, var14 - this.n, this.P, this.m);
                     var1.drawImage(this.b.k, this.S, var14 - this.n, 20);
                     var1.setClip(0, 0, this.b.e, this.b.b);
                     this.k.a(var1, this.B[this.a], this.Q - (this.k.a(this.B[this.a]) >> 1), var14 - (this.M >> 1) - 1, 20);
                     var1.setColor(0);
                     var1.drawLine(var4, var14 - this.n + 4, this.R, var14 - this.n + 4);
                     var1.drawLine(var4, var14 + this.n - 4, this.R, var14 + this.n - 4);
                     var1.drawLine(var4, var14 + this.n - 2, this.R, var14 + this.n - 2);
                     var1.drawLine(var4, var14 - this.n + 2, this.R, var14 - this.n + 2);
                     var1.setColor(12302336);
                     var1.drawLine(var4, var14 + this.n - 3, this.R, var14 + this.n - 3);
                     var1.drawLine(var4, var14 - this.n + 3, this.R, var14 - this.n + 3);
                     this.a(var1, this.w >> 1);
                     this.a(var1, 0, this.b.b >> 2, this.w >> 1);
                     this.a(var1);
                  }
               } else {
                  int var32 = (this.b.h[2][27] << 1) + (this.b.h[2][27] >> 1) + (this.b.h[2][38] << 1);
                  this.a(var1, 0, this.y, this.w >> 1);
                  var1.setColor(1516032);
                  var1.fillRect(0, this.h, this.b.e, this.q + 1);

                  for (int var40 = 0; var40 < this.x; var40++) {
                     int var11 = this.h + var40 * this.L + (this.L >> 1);
                     if (this.a != var40) {
                        var1.setColor(2967296);
                        var1.fillRect(2, this.h + var40 * this.L + (this.L >> 1) - (this.b.h[3][27] - 4 >> 1), this.b.e - 4, this.b.h[3][27] - 4);
                        var1.setColor(2967296);
                        var1.drawRect(this.b.e - var32 - 1, var11 - (this.b.h[3][27] >> 1) - 1, this.b.h[2][27] + 1, this.b.h[3][27] + 1);
                        this.b.a(var1, var40 + 27, this.b.e - var32, var11 - (this.b.h[3][27] >> 1));
                        if (var40 == 3) {
                           this.b.a(var1, 40, this.b.e - var32, var11 - (this.b.h[3][27] >> 1));
                        }

                        this.k.a(var1, this.B[var40], this.O, var11 - (this.M >> 1), 20);
                        switch (var40) {
                           case 0:
                              this.k
                                 .a(
                                    var1,
                                    "" + this.b.F,
                                    this.b.e - (this.b.h[2][27] >> 1) - (this.k.a("" + this.b.F) >> 1) - this.b.h[2][38] - (this.b.h[2][27] >> 2),
                                    var11 - (this.M >> 1),
                                    20
                                 );
                              break;
                           case 1:
                              this.k
                                 .a(
                                    var1,
                                    "" + this.b.H,
                                    this.b.e - (this.b.h[2][27] >> 1) - (this.k.a("" + this.b.H) >> 1) - this.b.h[2][38] - (this.b.h[2][27] >> 2),
                                    var11 - (this.M >> 1),
                                    20
                                 );
                              break;
                           case 2:
                              this.k
                                 .a(
                                    var1,
                                    "" + this.b.I,
                                    this.b.e - (this.b.h[2][27] >> 1) - (this.k.a("" + this.b.I) >> 1) - this.b.h[2][38] - (this.b.h[2][27] >> 2),
                                    var11 - (this.M >> 1),
                                    20
                                 );
                              break;
                           case 3:
                              this.k
                                 .a(
                                    var1,
                                    this.b.g[0] + ":" + this.b.g[1],
                                    this.b.e
                                       + (this.b.g[1] == this.b.g[0] ? 1 : 0)
                                       - (this.b.h[2][27] >> 1)
                                       - (this.b.h[2][27] >> 2)
                                       - (this.k.a(this.b.g[0] + ":" + this.b.g[1]) >> 1)
                                       - this.b.h[2][38],
                                    var11 - (this.M >> 1),
                                    20
                                 );
                        }
                     }
                  }

                  var1.setColor(4286208);
                  var1.fillRect(2, this.h + this.a * this.L + (this.L >> 1) - (this.b.h[3][27] - 4 >> 1), this.b.e - 4, this.b.h[3][27] - 4);
                  var1.setColor(12171264);
                  var1.drawRect(1, this.h + this.a * this.L + (this.L >> 1) - (this.b.h[3][27] - 4 >> 1) - 1, this.b.e - 3, this.b.h[3][27] - 3);
                  var1.drawRect(
                     this.b.e - var32 - 1, this.h + this.a * this.L + (this.L >> 1) - (this.b.h[3][27] >> 1) - 1, this.b.h[2][27] + 1, this.b.h[3][27] + 1
                  );
                  this.b.a(var1, this.a == 3 ? 40 : 27 + this.a, this.b.e - var32, this.h + this.a * this.L + (this.L >> 1) - (this.b.h[3][27] >> 1));
                  byte var12 = 38;
                  if (this.c == 2) {
                     var12 = 37;
                  }

                  this.b
                     .a(
                        var1,
                        var12,
                        this.b.e - var32 - this.b.h[2][38] - (this.b.h[2][38] >> 1),
                        this.h + this.a * this.L + (this.L >> 1) - (this.b.h[3][38] >> 1)
                     );
                  var12 = 36;
                  if (this.c == 1) {
                     var12 = 39;
                  }

                  this.b
                     .a(
                        var1,
                        var12,
                        this.b.e - this.b.h[2][27] + (this.b.h[2][38] >> 1) - (this.b.h[2][27] >> 1) - (this.b.h[2][38] << 1),
                        this.h + this.a * this.L + (this.L >> 1) - (this.b.h[3][36] >> 1)
                     );
                  this.k.a(var1, this.B[this.a], this.O, this.h + this.a * this.L + (this.L >> 1) - (this.M >> 1), 20);
                  switch (this.a) {
                     case 0:
                        this.k
                           .a(
                              var1,
                              "" + this.b.F,
                              this.b.e - (this.b.h[2][27] >> 1) - (this.b.h[2][27] >> 2) - (this.k.a("" + this.b.F) >> 1) - this.b.h[2][38],
                              this.h + this.a * this.L + (this.L >> 1) - (this.M >> 1),
                              20
                           );
                        break;
                     case 1:
                        this.k
                           .a(
                              var1,
                              "" + this.b.H,
                              this.b.e - (this.b.h[2][27] >> 1) - (this.b.h[2][27] >> 2) - (this.k.a("" + this.b.H) >> 1) - this.b.h[2][38],
                              this.h + this.a * this.L + (this.L >> 1) - (this.M >> 1),
                              20
                           );
                        break;
                     case 2:
                        this.k
                           .a(
                              var1,
                              "" + this.b.I,
                              this.b.e - (this.b.h[2][27] >> 1) - (this.b.h[2][27] >> 2) - (this.k.a("" + this.b.I) >> 1) - this.b.h[2][38],
                              this.h + this.a * this.L + (this.L >> 1) - (this.M >> 1),
                              20
                           );
                        break;
                     case 3:
                        this.k
                           .a(
                              var1,
                              this.b.g[0] + ":" + this.b.g[1],
                              this.b.e
                                 + (this.b.g[1] == this.b.g[0] ? 1 : 0)
                                 - (this.b.h[2][27] >> 2)
                                 - (this.b.h[2][27] >> 1)
                                 - (this.k.a(this.b.g[0] + ":" + this.b.g[1]) >> 1)
                                 - this.b.h[2][38],
                              this.h + this.a * this.L + (this.L >> 1) - (this.M >> 1),
                              20
                           );
                  }

                  this.a(var1, (byte)this.a, var2);
                  this.a(var1);
                  if (this.E) {
                     this.a(var1, this.B[this.z]);
                  }
               }
            }
         } else {
            var1.setColor(0);
            var1.fillRect(0, 0, this.b.e, this.b.b);
            var1.setColor(16777215);
            this.H = 6;
            if (this.z - this.x > 0) {
               this.F = this.G * (this.q - this.H) / (this.z - this.x) + this.h;
            }

            this.b.a(var1, 30, this.b.e - this.O - (this.b.h[2][27] + 5 >> 1) - (this.b.h[2][27] >> 1) - 1, 0);
            this.b.a(var1, 27, this.b.e - this.O - (this.b.h[2][27] + 5 >> 1) - (this.b.h[2][27] >> 1) - (this.b.h[2][27] + 5) - 1, 0);

            for (int var7 = this.G; var7 < this.x + this.G; var7++) {
               byte var8 = 0;
               byte var9 = 0;
               if (this.b.L) {
                  var8 = this.b.h[2][19];
                  var9 = this.b.h[3][19];
               } else {
                  var8 = this.b.h[2][20];
                  var9 = this.b.h[3][20];
               }

               if (this.b.ab[this.b.U[var7]][20] == 0) {
                  var1.setColor(11800593);
               } else {
                  var1.setColor(4351744);
               }

               var1.fillRect(this.O, this.h + (var7 - this.G) * this.L, this.b.e - (this.O << 1), this.L);
               if (this.b.ab[this.b.U[var7]][20] == 0) {
                  var1.setColor(6160384);
               } else {
                  var1.setColor(1516032);
               }

               var1.fillRect(
                  this.O + 2, this.h + (var7 - this.G) * this.L - (this.b.h[3][20] >> 1) + (this.L >> 1), this.b.e - (this.O << 1) - 4, this.b.h[3][20]
               );
               if (this.b.ab[this.b.U[var7]][20] == 0) {
                  var1.setColor(11800593);
               } else {
                  var1.setColor(4351744);
               }

               var1.drawLine(
                  this.b.e - this.O - (this.b.h[2][27] + 5),
                  this.h + (var7 - this.G) * this.L + (this.L >> 1) - (var9 >> 1) - 1,
                  this.b.e - this.O - (this.b.h[2][27] + 5),
                  this.h + (var7 - this.G) * this.L + (this.L >> 1) - (var9 >> 1) - 1 + this.b.h[3][20]
               );
               var1.drawLine(
                  this.b.e - this.O - (this.b.h[2][27] + 5 << 1),
                  this.h + (var7 - this.G) * this.L + (this.L >> 1) - (var9 >> 1) - 1,
                  this.b.e - this.O - (this.b.h[2][27] + 5 << 1),
                  this.h + (var7 - this.G) * this.L + (this.L >> 1) - (var9 >> 1) - 1 + this.b.h[3][20]
               );
               if (this.b.U[var7] == this.b.Y) {
                  if (this.b.L) {
                     var1.setColor(11800593);
                  } else {
                     var1.setColor(4351744);
                  }

                  var1.fillRect((this.O << 1) - 1, this.h + (var7 - this.G) * this.L + (this.L >> 1) - (var9 >> 1) - 1, var8 + 1, var9 + 1);
                  if (this.b.L) {
                     var1.setColor(6160384);
                  } else {
                     var1.setColor(1516032);
                  }

                  var1.drawRect((this.O << 1) - 1, this.h + (var7 - this.G) * this.L + (this.L >> 1) - (var9 >> 1) - 1, var8 + 1, var9 + 1);
               }

               this.b.a(var1, 20 - this.b.ab[this.b.U[var7]][20] / 110, this.O << 1, this.h + (var7 - this.G) * this.L + (this.L >> 1) - (var9 >> 1));
               this.k
                  .a(
                     var1,
                     this.b.O[(this.b.U[var7] << 1) + 1] + "",
                     this.b.e - this.O - (this.k.a(this.b.O[(this.b.U[var7] << 1) + 1] + "") >> 1) - (this.b.h[2][27] + 5 >> 1),
                     this.h + (var7 - this.G) * this.L + (this.L >> 1) - (this.M >> 1),
                     20
                  );
               this.k
                  .a(
                     var1,
                     this.b.O[this.b.U[var7] << 1] + "",
                     this.b.e - this.O - (this.k.a(this.b.O[this.b.U[var7] << 1] + "") >> 1) - (this.b.h[2][27] + 5 >> 1) - (this.b.h[2][27] + 5),
                     this.h + (var7 - this.G) * this.L + (this.L >> 1) - (this.M >> 1),
                     20
                  );
            }

            var1.setColor(12367873);
            var1.drawRect(this.O, this.h, this.b.e - (this.O << 1), this.q);
            if (this.z - this.x > 0) {
               var1.drawRect(this.b.e - this.O, this.F, this.O - 1, this.H);
               var1.setColor(0);
               var1.drawRect(this.b.e - this.O, this.F + 1, this.O - 2, this.H - 2);
               var1.setColor(16711680);
               var1.drawRect(this.b.e - this.O, this.F + 2, this.O - 3, this.H - 4);
            }

            this.a(var1);
         }
      } else {
         var1.setColor(1516544);
         var1.fillRect(0, 0, this.b.e, this.l);
         var1.fillRect(0, this.b.b - this.l, this.b.e, this.l);
         var1.setColor(2967296);
         var1.drawRect(0, 0, this.b.e - 1, this.l);
         var1.drawRect(0, this.b.b - this.l, this.b.e - 1, this.l - 1);
         var1.setColor(12301068);
         var1.drawRect(0, this.l, this.b.e - this.O, this.b.b - (this.l << 1));
         if (this.x >= this.z) {
            this.H = this.u;
         } else {
            this.H = this.x * this.u / (this.z - this.x);
         }

         this.H = 6;
         if (this.x != this.z) {
            this.F = this.G * (this.u - this.H) / (this.z - this.x) + this.l;
         } else {
            this.F = this.l;
         }

         if (this.F > this.b.b - this.l - this.H) {
            this.F = this.b.b - this.l - this.H;
         }

         if (this.z > this.x) {
            var1.drawRect(this.b.e - this.O, this.F, this.O - 1, this.H);
            var1.setColor(0);
            var1.drawRect(this.b.e - this.O, this.F + 1, this.O - 2, this.H - 2);
            if (this.A) {
               var1.setColor(13434880);
               this.A = false;
            } else {
               var1.setColor(2967296);
            }

            var1.drawRect(this.b.e - this.O, this.F + 2, this.O - 3, this.H - 4);
         }

         this.k.a(var1, this.B[0], this.Q - (this.b.s.a(this.B[0]) >> 1), (this.l >> 1) - (this.M >> 1), 20);

         for (int var3 = this.G; var3 < this.x + this.G; var3++) {
            if (this.B[var3] != null && this.B[var3].length() > 0 && var3 != 0) {
               if (this.B[var3].charAt(0) == '|') {
                  this.k
                     .a(var1, this.B[var3].substring(1, this.B[var3].length()), this.Q - (this.b.s.a(this.B[var3]) >> 1), this.j + this.L * (var3 - this.G), 20);
               } else {
                  this.k.a(var1, this.B[var3], this.O, this.j + this.L * (var3 - this.G), 20);
               }
            }
         }

         this.a(var1);
      }
   }
}
