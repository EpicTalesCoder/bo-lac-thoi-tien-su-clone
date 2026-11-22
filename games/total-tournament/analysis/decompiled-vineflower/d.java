import java.io.InputStream;
import javax.microedition.lcdui.Display;
import javax.microedition.media.Manager;
import javax.microedition.media.Player;

public final class d implements Runnable {
   private static boolean b = false;
   private static e c;
   private static boolean d = true;
   private static boolean e = true;
   private static boolean f = false;
   private static boolean g = false;
   private static Player[] h;
   private static boolean i = true;
   static d a;
   private static int j;
   private static int k = -1;
   private static int l = -1;
   private static Thread m;
   private static long n = 0L;

   private d(e var1) {
      c = var1;
      if (e) {
         e.u = 6;
      }
   }

   private static void b(int var0) {
      if (e) {
         e.u = 6;
      }

      if (h == null) {
         h = new Player[e.u + 1];
      }

      if (h[var0] == null) {
         String var1 = "/" + var0 + ".mid";
         if (var0 == e.u) {
            var1 = "/mm.mid";
         }

         int var8 = var0;
         String var7 = var1;
         h[var8] = null;
         InputStream var2 = null;

         try {
            var2 = c.getClass().getResourceAsStream(var7);
         } catch (Exception var6) {
         }

         try {
            if (var2 == null && var7.endsWith(".mid")) {
               var7 = var7.substring(0, var7.length() - 4) + ".amr";
               var2 = c.getClass().getResourceAsStream(var7);
            }
         } catch (Exception var5) {
         }

         try {
            String var3 = "audio/midi";
            if (var7.endsWith(".amr")) {
               var3 = "audio/amr";
            }

            h[var8] = Manager.createPlayer(var2, var3);
            h[var8].realize();
            h[var8].prefetch();
         } catch (Exception var4) {
         }
      }
   }

   private static void c() {
      if (h == null) {
         d();
      }

      if (i) {
         d = true;
         if (m == null) {
            (m = new Thread(a)).start();
         }

         if (m.getPriority() != 1) {
            m.setPriority(1);
         }
      }
   }

   private static void d() {
      if (h == null) {
         h = new Player[e.u + 1];
      }

      for (int var0 = 0; var0 < h.length; var0++) {
         if (h[var0] == null) {
            b(var0);
         }
      }
   }

   public final void run() {
      if (h == null) {
         d();
      }

      int var3 = -1;

      while (d) {
         if (k >= 0 && var3 >= 0 && var3 != k && !e()) {
            a(k, false);
            var3 = k;
            l = k;
         }

         try {
            Thread.sleep(3L);
         } catch (Exception var2) {
         }

         if (j >= 0) {
            c(j);
            var3 = j;
            j = -1;
         }

         try {
            Thread.sleep(17L);
         } catch (Exception var1) {
         }
      }
   }

   public static final void a(int var0) {
      if (h == null) {
         c();
      }

      if (i) {
         j = var0;
      } else {
         c(var0);
      }
   }

   private static void c(int var0) {
      if (h == null) {
         c();
      }

      a(var0, true);
   }

   private static void a(int var0, boolean var1) {
      if (l >= 0) {
         d(l);
      }

      int var2 = var0;

      try {
         if (h[var2] == null) {
            b(var2);
         }

         if (h[var2] != null) {
            if (h[var2].getState() == 0) {
               b(var2);
            }

            if (h[var2].getState() == 100) {
               h[var2].realize();
            }

            if (h[var2].getState() == 200) {
               h[var2].prefetch();
            }
         }
      } catch (Exception var4) {
      }

      try {
         if (var1) {
            h[var0].start();
         }

         l = var0;
      } catch (Exception var3) {
      }
   }

   public static final void a(e var0) {
      a = new d(var0);
      if (e) {
         e.u = 6;
      }
   }

   private static boolean e() {
      try {
         return l >= 0 && h[l] != null && h[l].getState() == 400;
      } catch (Exception var0) {
         return false;
      }
   }

   private static void d(int var0) {
      if (var0 >= 0 && h[var0] != null) {
         try {
            if (h[var0].getState() == 400) {
               h[var0].stop();
            }

            return;
         } catch (Exception var1) {
         }
      }
   }

   public static void a() {
      if (h != null) {
         try {
            for (int var0 = 0; var0 < h.length; var0++) {
               d(var0);
            }

            return;
         } catch (Exception var1) {
         }
      }
   }

   public static void b() {
      byte var0 = 110;
      long var1;
      if ((var1 = System.currentTimeMillis()) >= n) {
         try {
            Display.getDisplay(tr.a).vibrate(110);
         } catch (Exception var3) {
         }

         n = var1 + 110 + 7L;
      }
   }
}
