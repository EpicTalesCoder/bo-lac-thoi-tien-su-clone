import javax.microedition.lcdui.Graphics;

public final class g {
   public static final String[] a = new String[]{"road", "grass", "woods", "hill", "mountain", "water", "bridge", "town"};
   public static final byte[] a = new byte[]{0, 1, 1, 1, 4, 5, 6, 7, 7, 7};
   public static final byte[] b = new byte[]{0, 1, 2, 3, 4, 5, 6, 7, 7, 7};
   public static final String[] b = new String[]{"soldier", "archer", "lizard", "wizard", "wisp", "spider", "golem", "catapult", "wyvern", "king", "skeleton"};
   public i a;
   public c a;
   public byte a;
   public boolean a = false;
   public boolean b = false;
   public boolean c;
   public byte b;
   public byte c;
   public byte d;
   public byte e;
   public byte f;
   public byte g;
   public boolean d;
   public int a = 0;
   public static final byte[] c = new byte[]{3, -3};
   public f a;
   public f b;
   public f c;
   public f d;
   public int b;
   public int c;
   public long a;
   public long b;
   public long c;
   public f[] a;
   public h[] a;
   public h a;
   public g a;
   public int d;
   public int e;
   public int f;
   public int g;
   public boolean e = false;
   public int h;
   public int i;
   public int[][] a;
   public int[] a;
   public int j;
   public int k = 20;
   public int l;
   public int m;
   public byte[][] a;
   public f e;
   public f f;
   public f[] b;
   public int n;
   public int o;

   public g(i var1, c var2, g var3) throws Exception {
      this.a = var1;
      this.a = var2;
      this.a = var2.d;
      this.a = var3;
      this.b = (byte)var2.g;
      this.h = this.b;
      this.d = (byte)var2.c();
      this.f = this.d;
      int var4 = 0;
      if (var3 == null) {
         this.g = 0;
         this.b = 0;
         this.d = true;
      } else {
         var4 = var1.c;
         this.g = 1;
         this.a = 0;
      }

      this.d = var1.a(var2.c, var2.d);
      byte var5 = b[this.d];
      byte var6 = a[this.d];
      if (var3 != null && var6 == a[var3.d]) {
         this.a = new h[var3.a.length];
         System.arraycopy(var3.a, 0, this.a, 0, this.a.length);
      } else {
         this.a = (new f(a[var6])).a;
      }

      if (this.g == 1) {
         for (int var7 = 0; var7 < this.a.length; var7++) {
            this.a[var7] = new h(this.a[var7], 1);
         }
      }

      try {
         if (var3 != null && var5 == b[var3.d]) {
            this.a = var3.a;
         } else {
            this.a = new h(a[var5] + "_bg");
         }

         if (this.g == 1) {
            this.a = new h(this.a, 1);
         }
      } catch (Exception var9) {
      }

      if (this.a != null) {
         this.e = this.a.b;
      }

      this.f = var1.c / this.a[0].a;
      if (var1.c % this.a[0].a != 0) {
         this.f++;
      }

      this.g = (var1.aH - this.e) / this.a[0].b;
      if ((var1.aH - this.e) % this.a[0].b != 0) {
         this.g++;
      }

      this.a = new byte[this.f][this.g];

      for (int var10 = 0; var10 < this.f; var10++) {
         for (int var8 = 0; var8 < this.g; var8++) {
            this.a[var10][var8] = (byte)Math.abs(e.a.nextInt() % this.a.length);
         }
      }

      this.a = new f(b[this.a], var1.j[var2.e]);
      if (var3 != null && var3.a == this.a) {
         if (var3.d != null) {
            this.d = new f(var3.d);
         }

         if (var3.b != null) {
            this.b = new f(var3.b);
         }

         if (var3.c != null) {
            this.c = new f(var3.c);
         }

         if (var3.e != null) {
            this.e = new f(var3.e);
            this.f = new f(var3.f);
         }
      } else if (this.a == 0 || this.a == 10 || this.a == 5) {
         this.d = new f("slash");
      } else if (this.a == 1) {
         this.c = new f("archer_arrow");
      } else if (this.a == 9) {
         this.b = new f("kingwave");
         this.d = new f("kingslash");
         this.e = new f("king_heads");
         this.f = new f("king_heads_back");
      } else if (this.a == 2) {
         this.b = new f("watermagic");
         this.c = new f("fish");
      } else if (this.a == 7 || this.a == 6) {
         this.c = new f("crater");
      } else if (this.a == 3) {
         this.b = new f("spell");
         this.c = this.b;
      }

      if (this.b != null) {
         this.b.a(0, this.d);
      }

      if (this.c != null) {
         this.c.a(0, this.d);
      }

      if (this.d != null) {
         this.d.a(0, this.d);
      }

      if (this.e != null) {
         this.e.a(var2.j, this.d);
         this.e.c(var2.j);
         this.f.a(0, this.d);
         this.f.c(var2.j);
      }

      this.a = new int[var2.a.length][2];

      for (int var11 = 0; var11 < this.a.length; var11++) {
         this.a[var11][0] = var2.a[var11][0] * var1.W / 128;
         if (this.g == 1) {
            this.a[var11][0] = var1.c - this.a[var11][0] - this.a.p + var4;
         }

         this.a[var11][1] = var2.a[var11][1] * var1.aH / 128 - this.a.q;
      }

      this.a = new f[this.d];
      if (this.a == 4 || this.a == 6) {
         this.a = new int[this.d];
      }

      for (int var12 = 0; var12 < this.d; var12++) {
         this.a[var12] = new f(this.a);
         var1.a(this.a[var12]);
         this.a[var12].b(this.a[var12][0], this.a[var12][1]);
         this.a[var12].a(0, this.d);
         this.a[var12].e = false;
         this.a[var12].w = 0;
         if (this.a == 6) {
            this.a[var12].g = true;
            this.a[var12] = e.a(360);
            this.a[var12].r = -6 + 4 * a.a(this.a[var12]) >> 10;
         } else if (this.a == 4) {
            this.a[var12].g = true;
            this.a[var12].r = -5 - e.a(10);
            this.a[var12] = e.a(360);
         } else if (this.a == 9) {
            this.a[var12].a = this.e;
            this.a[var12].b = this.f;
         }
      }
   }

   public final int a(f var1, int var2) {
      return this.g == 1 ? this.a.p - var2 - var1.p : var2;
   }

   public final void a() {
      this.a = true;
      this.a = 1;
      this.b = this.a.c;
   }

   public final void b() {
      switch (this.a) {
         case 1:
            if (this.a == 6) {
               if (this.l == 0) {
                  if (this.a.c - this.b >= 200L) {
                     if (this.o < this.f) {
                        this.a[this.o].z = -1;
                        this.a[this.o].g = false;
                        this.a[this.o].x = 0;
                     }

                     if (++this.o >= this.f) {
                        this.o = 0;
                        this.l = 1;
                        this.b = this.a.c;
                        return;
                     }
                  }
               } else if (this.l == 1) {
                  if (this.a.c - this.b >= 200L) {
                     if (this.o < this.f) {
                        this.a[this.o].x = -1;
                     }

                     if (++this.o >= this.f) {
                        this.o = 0;
                        this.l = 2;
                        this.b = this.a.c;
                        return;
                     }
                  }
               } else if (this.l == 2) {
                  boolean var8 = true;
                  if (this.a.c - this.b >= 200L) {
                     if (this.o < this.f) {
                        this.a[this.o].z = 0;
                        this.a[this.o].x = 0;
                        this.a[this.o].a(2, this.d);
                        this.a[this.o].s = 1;
                     }

                     if (++this.o < this.f) {
                        var8 = false;
                     }
                  } else {
                     var8 = false;
                  }

                  for (int var11 = 0; var11 < this.f; var11++) {
                     if (this.a[var11].z != 0) {
                        if (this.a[var11].z != -1) {
                           if (this.a[var11].s > 0) {
                              var8 = false;
                           } else if (this.a[var11].s != -1) {
                              if (this.a[var11].z == 1) {
                                 this.a[var11].a(3, this.d);
                                 this.a[var11].s = 1;
                                 this.a[var11].z = 2;
                                 var8 = false;
                              } else if (this.a[var11].z == 2) {
                                 this.a[var11].r = -6;
                                 this.a[var11].g = true;
                                 this.a[var11].x = e.a(-2, 3);
                                 this.a[var11].a(0, this.d);
                                 this.a[var11].s = -1;
                                 this.a[var11].z = 3;
                                 var8 = false;
                              }
                           }
                        }
                     } else {
                        if (this.a[var11].m == 1) {
                           this.a[var11].r = 0;
                           this.a[var11].z = 1;
                           e.c(200);
                           this.a.d(1200);
                           e.b(14, 1);

                           for (int var17 = 0; var17 < 2; var17++) {
                              f var23;
                              (var23 = f.a(this.a.g, 0, 0, -1, 1, e.a(4) * 50, (byte)0))
                                 .b(this.a[var11].n + e.a(this.a.p - var23.p), this.a[var11].o + this.a.q - var23.q + 2);
                              var23.f = true;
                              this.a.a(var23);
                           }

                           f var18;
                           (var18 = f.a(this.a.g, -1, 0, -1, 1, e.a(4) * 50, (byte)0)).b(this.a[var11].n, this.a[var11].o + this.a.q - var18.q + 2);
                           var18.f = true;
                           this.a.a(var18);
                           (var18 = f.a(this.a.g, 1, 0, -1, 1, e.a(4) * 50, (byte)0))
                              .b(this.a[var11].n + this.a.p - var18.p, this.a[var11].o + this.a.q - var18.q + 2);
                           var18.f = true;
                           this.a.a(var18);
                        }

                        var8 = false;
                     }
                  }

                  if (var8) {
                     this.l = 0;
                     this.b = this.a.c;
                     this.a = 4;
                     return;
                  }
               }
            } else if (this.l == 0) {
               if (this.a.c - this.b >= 200L) {
                  if (this.a == 9) {
                     this.b = new f[this.f * 2];
                  } else if (this.a != 7 && this.a != 1) {
                     this.b = new f[this.f];
                  }

                  this.l = 1;
                  this.o = 0;
                  this.b = this.a.c;
                  return;
               }
            } else if (this.l == 1) {
               boolean var9 = true;
               if (this.o < this.f) {
                  this.a[this.o].a(2, this.d);
                  this.a[this.o].s = 1;
                  if (this.a == 3 || this.a == 2) {
                     this.b[this.o] = f.a(this.b, 0, 0, 0, 1, 50, (byte)0);
                     this.b[this.o].b(this.a[this.o].n + this.a(this.b[this.o], this.a[this.o].p), this.a[this.o].o);
                     this.a.a(this.b[this.o]);
                  } else if (this.a == 1) {
                     f var14;
                     (var14 = f.a(this.c, 0, 0, 0, 1, 0, (byte)0)).a(1, this.d);
                     var14.b(this.a[this.o].n + this.a(var14, this.a[this.o].p), this.a[this.o].o);
                     this.a.a(var14);
                  } else if (this.a == 7) {
                     this.a[this.o].y = 5;

                     for (int var13 = 0; var13 < 3; var13++) {
                        f var21;
                        (var21 = f.a(this.a.r, e.a(-1, 2), 0, 0, 1, e.a(4) * 50, (byte)0)).b(this.a[this.o].n + this.a.p / 2, this.a[this.o].o);
                        var21.f = true;
                        this.a.a(var21);
                     }
                  } else if (this.a == 9) {
                     f var12;
                     (var12 = f.a(this.d, 0, 0, 0, 1, 200, (byte)0)).b(this.a[0].n, this.a[0].o + this.a.q);
                     var12.r = -this.a.q;
                     this.a.a(var12);
                     this.b[0] = f.a(this.b, c[this.g] * 3, -2, 0, -1, 100, (byte)0);
                     int var20 = this.a[this.o].n + this.a(this.b[this.o], this.a[this.o].p / 2);
                     int var24 = this.a[this.o].o + this.a.q - this.b[this.o].q + 2;
                     this.b[0].b(var20, var24);
                     this.b[1] = f.a(this.b, c[this.g] * 3, 1, 0, -1, 100, (byte)0);
                     this.b[1].b(var20, var24);
                     this.a.a(this.b[1]);
                     this.b[1].l = this.g;
                     this.a.a(this.b[0]);
                     this.b[0].l = this.g;
                  } else if (this.a == 8) {
                     this.b[this.o] = f.a(null, c[this.g], 0, 0, -1, 2000, (byte)6);
                     this.b[this.o].b(this.a[this.o].n + this.a(this.b[this.o], this.a[this.o].p + 2), this.a[this.o].o + 30);
                     this.b[this.o].f = true;
                     e.c(200);
                     this.a.d(1200);
                     e.b(14, 1);
                     this.a.a(this.b[this.o]);
                  }
               }

               if (++this.o < this.f) {
                  var9 = false;
               }

               for (int var15 = 0; var15 < this.f; var15++) {
                  if (this.a[var15].s > 0) {
                     var9 = false;
                  } else if (this.a != 7 && this.a[var15].s != -1) {
                     if (this.a[var15].z == 0) {
                        this.a[var15].a(3, this.d);
                        this.a[var15].s = 1;
                        this.a[var15].z = 1;
                        if (this.a == 8) {
                           this.b[var15].d = false;
                        }

                        var9 = false;
                     } else if (this.a[var15].z == 1) {
                        this.a[var15].a(0, this.d);
                        this.a[var15].s = -1;
                        this.a[var15].z = 2;
                        var9 = false;
                     }
                  }

                  if (this.a == 8 && this.b[var15] != null && this.b[var15].d) {
                     f var22;
                     (var22 = f.a(this.a.r, c[this.g] * e.a(1, 4), e.a(-2, 3), 0, 1, 50 * e.a(4), (byte)0))
                        .b(this.a[var15].n + this.a(var22, this.a.p), this.b[var15].o + e.a(30 - this.b[var15].q) - 15);
                     var22.f = true;
                     this.a.a(var22);
                  }
               }

               if (var9) {
                  if (this.a.d == 9) {
                     this.a = 6;
                  } else {
                     this.a = 4;
                  }

                  this.m = 400;
                  if (this.a.d == 8) {
                     this.m = 0;
                  }

                  this.b = this.a.c;
                  this.l = 0;
                  return;
               }
            }
         case 2:
         case 3:
         case 5:
         default:
            break;
         case 4:
            if (this.l == 0) {
               if (this.a.c - this.b >= this.m) {
                  this.a.f();
                  if (this.a != 1) {
                     this.a.d(200);
                  }

                  e.c(200);
                  e.b(14, 1);
                  if (this.c != null) {
                     this.n = c.a[this.a].length;
                  }

                  this.l = 1;
                  return;
               }
            } else if (this.l == 1) {
               if (--this.n < 0) {
                  this.a = 7;
                  this.b = this.a.c;
                  return;
               }

               f var10;
               if (this.a != 3 && this.a != 2 && this.a != 1) {
                  var10 = f.a(this.c, 0, 0, 0, -1, 0, (byte)0);
               } else {
                  var10 = f.a(this.c, 0, 0, 0, 1, 0, (byte)0);
               }

               if (this.a == 2 || this.a == 1) {
                  var10.e = false;
               }

               int var16 = e.a(this.a.a / 2 - var10.p);
               int var4 = 0;
               if (this.a.a != null) {
                  var4 = 0 + (this.a.a.b - var10.q);
               }

               int var5 = (this.a.aH - var4) * (this.n * 2 + 1) / (c.a[this.a].length * 2) - var10.q / 2 + var4;
               if (this.g == 0) {
                  var16 += this.a.c;
               }

               if (this.a == 7 || this.a == 6) {
                  var10.r = var5;
                  var5 = 0;
               }

               var10.b(var16, var5);
               this.a.a(var10);

               for (int var6 = 0; var6 < 3; var6++) {
                  f var7;
                  if (this.a != 7 && this.a != 6) {
                     (var7 = f.a(this.a.r, e.a(-1, 2), 0, -1, 1, 100, (byte)0)).b(var16 + e.a(var10.p - var7.p), var5 + var10.q - var7.q + 1);
                  } else {
                     (var7 = f.a(this.a.g, e.a(-1, 2), 0, e.a(-2, 0), 1, e.a(4) * 50, (byte)0))
                        .b(var16 + e.a(var10.p - var7.p), var10.r + var10.q - var7.q + 1);
                     var7.r = -var10.q / 2;
                  }

                  this.a.a(var7);
               }
            }
            break;
         case 6:
            boolean var1 = true;

            for (int var2 = 0; var2 < this.b.length; var2++) {
               if (this.a == 9 && e.a(2) == 0) {
                  f var3;
                  (var3 = f.a(this.a.r, e.a(-2, 1), 0, -1, 1, 100, (byte)0))
                     .b(this.b[var2].n + this.a(this.b[var2], 0), this.b[var2].o + this.b[var2].q - var3.q);
                  if (this.b[var2].z == 1) {
                     var3.l = this.a.g;
                  } else {
                     var3.l = this.g;
                  }

                  this.a.a(var3);
               }

               if (this.a == 9) {
                  if (this.g == 0) {
                     if (this.b[var2].n >= this.a.a) {
                        if (this.b[var2].z == 0) {
                           this.b[var2].b(this.a.c - this.b[var2].p, this.b[var2].o);
                           this.b[var2].l = this.a.g;
                           this.b[var2].z = 1;
                           var1 = false;
                        } else if (this.b[var2].z == 1) {
                           this.a.b(this.b[var2]);
                           this.b[var2].z = 2;
                        }
                     } else {
                        var1 = false;
                     }
                  } else if (this.g == 1) {
                     if (this.b[var2].n + this.b[var2].p < 0) {
                        if (this.b[var2].z == 0) {
                           this.b[var2].b(this.a.c, this.b[var2].o);
                           this.b[var2].l = this.a.g;
                           this.b[var2].z = 1;
                           var1 = false;
                        } else if (this.b[var2].z == 1) {
                           this.a.b(this.b[var2]);
                           this.b[var2].z = 2;
                        }
                     } else {
                        var1 = false;
                     }
                  }
               }
            }

            if (var1) {
               this.l = 0;
               this.a = 4;
               this.b = this.a.c;
               return;
            }
            break;
         case 7:
            if (this.a.c - this.b >= 1000L) {
               this.a = 0;
               this.b = true;
            }
      }
   }

   public final void c() {
      for (int var1 = 0; var1 < this.f; var1++) {
         this.a[var1].y = 6;
      }
   }

   public final void d() {
      switch (this.a) {
         case 1:
            if (this.l == 0) {
               if (this.a.c - this.b >= 200L) {
                  this.l = 1;
                  this.b = this.a.c;
               }
            } else {
               if (this.l == 1) {
                  this.k += 5;
                  if (this.k >= 90) {
                     this.l++;
                     this.b = this.a.c;
                  }

                  if ((this.k - 20) % 15 == 0) {
                     for (int var1 = 0; var1 < this.a.length; var1++) {
                        f var2;
                        (var2 = f.a(this.a.r, e.a(-1, 2), 0, 0, 1, 100, (byte)0))
                           .b(this.a[var1].n + e.a(this.a.p - var2.p), this.a[var1].o + this.a.q - var2.q + 1);
                        this.a.a(var2);
                     }
                  }
               } else if (this.l == 2 && this.a.c - this.b >= 400L) {
                  this.k = 20;
                  this.a.f();
                  this.a = 4;
                  this.a.e = false;
                  this.b = this.a.c;
               }

               if (++this.j >= 2) {
                  for (int var4 = 0; var4 < this.a.a.length; var4++) {
                     f var6;
                     (var6 = f.a(this.a.i, 0, 0, 0, 1, 50, (byte)0))
                        .b(this.a.a[var4].n + e.a(this.a.a[var4].p - var6.p), this.a.a[var4].o + e.a(this.a.a[var4].q - var6.q));
                     var6.f = true;
                     this.a.a(var6);
                  }

                  this.j = 0;
                  this.a.c();
               }
            }
            break;
         case 4:
            if (this.a.c - this.b >= 800L) {
               this.b = true;
               this.a = 0;
            }
      }

      boolean var5 = false;
      if (this.a.c - this.a >= 300L) {
         var5 = true;
         this.a = this.a.c;
      }

      for (int var7 = 0; var7 < this.a.length; var7++) {
         if (var5) {
            f var3;
            (var3 = f.a(null, 0, 0, 0, 1, 500, (byte)4)).b(this.a[var7].n + (this.a[var7].p >> 1), this.a[var7].o + (this.a[var7].q >> 1) + this.c);
            this.a.a(var3);
         }

         int var8 = this.a[var7].p / 3;
         this.a[var7].b(this.a[var7][0] + (var8 * a.b(this.a[var7]) >> 10), this.a[var7][1] + (var8 * a.a(this.a[var7]) / 3 >> 10));
         this.a[var7] = (this.a[var7] + this.k) % 360;
      }
   }

   public final void e() {
      if (this.e) {
         if (this.a.c - this.c >= 300L) {
            this.e = false;
            this.b = 0;
            this.c = 0;
         } else {
            if (this.b > 0) {
               this.b = -2;
            } else {
               this.b = 2;
            }

            this.c = e.a.nextInt() % 1;
         }
      }

      if (this.c && this.h > this.c) {
         this.h -= 2;
         if (this.h < this.c) {
            this.h = this.c;
         }

         this.a.F = true;
      }

      if (this.a == 8 || this.a == 9 || this.a == 7 || this.a == 1 || this.a == 3 || this.a == 2 || this.a == 6) {
         this.b();
      } else if (this.a == 4) {
         this.d();
      } else {
         boolean var1 = false;
         switch (this.a) {
            case 1:
               if (this.a.c - this.b >= 200L) {
                  this.a = 3;
               }
            case 2:
            case 5:
            default:
               break;
            case 3:
               boolean var6 = true;
               if (this.l < this.f) {
                  if (this.a == 0 || this.a == 5) {
                     this.a[this.l].x = -6;
                  }

                  if (this.a == 5) {
                     this.a[this.l].v = 2 * c[this.g];

                     for (int var7 = 0; var7 < 3; var7++) {
                        f var4;
                        (var4 = f.a(this.a.r, e.a(-1, 2), 0, -1, 1, 100, (byte)0))
                           .b(this.a[this.l].n + e.a(this.a.p - var4.p), this.a[this.l].o + this.a.q - var4.q + 1);
                        this.a.a(var4);
                     }
                  } else {
                     this.a[this.l].v = c[this.g];
                  }

                  this.a[this.l].a(1, this.d);
                  this.l++;
                  var6 = false;
               }

               for (int var8 = 0; var8 < this.l; var8++) {
                  if (this.a == 10) {
                     if (this.a[var8].z != -1) {
                        this.a[var8].z++;
                        if (this.a[var8].z >= 16) {
                           this.a[var8].a(2, this.d);
                           this.a[var8].v = 0;
                           this.a[var8].z = -1;
                           f var9;
                           (var9 = f.a(null, 0, 0, 0, 1, 800, (byte)2)).b(this.a[var8].n + this.a(var9, this.a.p), this.a[var8].o + this.a.q);
                           this.a.a(var9);
                           (var9 = f.a(this.d, 0, 0, 0, 1, 150, (byte)0)).b(this.a[var8].n + this.a(var9, 24), this.a[var8].o + 3);
                           this.a.a(var9);
                        } else {
                           var6 = false;
                        }
                     }
                  } else if (this.a[var8].r < 0) {
                     this.a[var8].x++;
                     var6 = false;
                  } else if (this.a[var8].x >= 6) {
                     this.a[var8].r = 0;
                     this.a[var8].x = 0;
                     this.a[var8].v = 0;
                     if (this.a == 0 || this.a == 5) {
                        this.a[var8].a(2, this.d);
                        if (this.a == 0) {
                           f var11;
                           (var11 = f.a(this.d, 0, 0, 0, 1, 150, (byte)0)).b(this.a[var8].n + this.a(var11, 14), this.a[var8].o + this.a[var8].q);
                           var11.r = 4 - this.a[var8].q;
                           this.a.a(var11);
                        } else if (this.a == 5) {
                           f var12;
                           (var12 = f.a(this.a.i, 0, 0, 0, 1, 50, (byte)0))
                              .b(this.a[var8].n + this.a(var12, this.a.p * 3 / 4), this.a[var8].o + this.a[var8].q);
                           var12.r = -var12.q;
                           this.a.a(var12);
                        }
                     }
                  }
               }

               if (var6) {
                  this.l = 0;
                  this.a = 6;
                  this.a.f();
                  this.a.d(200);
                  e.c(200);
                  e.b(14, 1);
                  this.b = this.a.c;
               }
               break;
            case 4:
               boolean var2 = true;
               if (this.l < this.f) {
                  if (this.a == 0 || this.a == 2 || this.a == 5) {
                     this.a[this.l].x = -6;
                  } else if (this.a == 10) {
                     this.a[this.l].z = 0;
                  }

                  if (this.a == 5) {
                     this.a[this.l].v = -2 * c[this.g];
                  } else {
                     this.a[this.l].v = -c[this.g];
                  }

                  this.a[this.l].a(3, this.d);
                  this.l++;
                  var2 = false;
               }

               for (int var3 = 0; var3 < this.l; var3++) {
                  if (this.a == 10) {
                     if (this.a[var3].z != -1) {
                        this.a[var3].z++;
                        if (this.a[var3].z >= 16) {
                           this.a[var3].a(0, this.d);
                           this.a[var3].v = 0;
                           this.a[var3].z = -1;
                        } else {
                           var2 = false;
                        }
                     }
                  } else if (this.a[var3].r < 0) {
                     this.a[var3].x++;
                     var2 = false;
                  } else if (this.a[var3].x >= 6) {
                     this.a[var3].x = 0;
                     this.a[var3].v = 0;
                     this.a[var3].r = 0;
                     this.a[var3].a(0, this.d);
                  }
               }

               if (var2) {
                  this.b = true;
                  this.a = 0;
                  this.b = this.a.c;
               }
               break;
            case 6:
               if (this.a == 10 && this.a.c - this.b >= 400L || (this.a == 0 || this.a == 2 || this.a == 5) && this.a.c - this.b >= 50L) {
                  this.a = 4;
               }
         }
      }

      if (this.a == 6) {
         for (int var5 = 0; var5 < this.a.length; var5++) {
            if (this.a[var5].g) {
               this.a[var5].r = -6 + 4 * a.a(this.a[var5]) >> 10;
               this.a[var5] = (this.a[var5] + 10) % 360;
            }
         }
      }
   }

   public final void f() {
      this.c = true;
      this.i = this.d - this.e;
      this.f = this.e;

      for (int var1 = 0; var1 < this.i; var1++) {
         this.a.b(this.a[var1]);
         f var2;
         (var2 = f.a(this.a.i, 0, 0, 0, 1, 0, (byte)0)).b(this.a[var1].n + (this.a[var1].p - var2.p) / 2, this.a.X);
         var2.r = this.a[var1].o + (this.a[var1].q - var2.q) / 2 - this.a.X;
         this.a.a(var2);

         for (int var4 = 0; var4 < 3; var4++) {
            f var3;
            (var3 = f.a(this.a.r, -1 + var4, 0, e.a(-4, -1), 1, e.a(4) * 50, (byte)0))
               .b(this.a[var1].n + (this.a[var1].p - var3.p) / 2, this.a[var1].o + this.a[var1].q - var3.q + 3);
            this.a.a(var3);
         }

         f var7;
         (var7 = f.a(this.a.g, 0, 0, -1, 1, 200, (byte)0)).b(this.a[var1].n + (this.a[var1].p - var7.p) / 2, this.a[var1].o + this.a[var1].q - var7.q + 3);
         this.a.a(var7);
      }

      f[] var5 = new f[this.f];
      System.arraycopy(this.a, this.i, var5, 0, this.f);
      this.a = var5;
      f var6 = f.a("" + (this.c - this.b), 0, -4, (byte)1);
      int var8;
      int var9;
      if (this.e == 1) {
         var8 = this.a[0].n + this.a[0].p / 2;
         var9 = this.a[0].o + this.a[0].q + 1;
      } else {
         var8 = this.a.c / 2;
         if (this.g == 1) {
            var8 += this.a.c;
         }

         var9 = (this.a.aH + this.e) / 2;
      }

      var6.b(var8, var9);
      var6.f = true;
      this.a.a(var6);
   }

   public final void a(Graphics var1, int var2, int var3) {
      var1.translate(var2, var3);
      int var4 = 0;
      int var6 = 0;

      for (int var7 = this.f; var6 < var7; var6++) {
         int var5 = this.e + var3;
         int var8 = 0;

         for (int var9 = this.g; var8 < var9; var8++) {
            this.a[this.a[var6][var8]].a(var1, var4, var5);
            var5 += 24;
         }

         var4 += 24;
      }

      if (this.a != null) {
         var6 = this.a.a;
         var4 = 0;
         int var12 = 0;

         for (int var13 = this.a.c / var6; var12 < var13; var12++) {
            this.a.a(var1, var4, 0);
            var4 += var6;
         }
      }

      var1.translate(-var2, -var3);
   }

   public final void a(Graphics var1) {
      int var2 = this.a.X - i.a / 2;
      e.a(var1, this.h + "/" + 100, this.a.c / 2, var2, 1, 3);
   }

   public final void b(Graphics var1) {
      var1.setColor(4210752);

      for (int var2 = 0; var2 < this.f; var2++) {
         f var3 = this.a[var2];
         if (this.a == 0 || this.a == 4 || this.a == 5 || this.a == 6) {
            var1.fillArc(var3.n, var3.o + var3.q * 4 / 5, var3.p, var3.q / 4, 0, 360);
         }
      }
   }

   static {
      byte[] var10000 = new byte[]{18, -18};
   }
}
