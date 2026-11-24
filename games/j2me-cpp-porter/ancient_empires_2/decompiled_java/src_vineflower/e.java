import java.io.ByteArrayInputStream;
import java.io.DataInputStream;
import java.io.InputStream;
import java.util.Random;
import javax.microedition.lcdui.Canvas;
import javax.microedition.lcdui.Command;
import javax.microedition.lcdui.CommandListener;
import javax.microedition.lcdui.Display;
import javax.microedition.lcdui.Displayable;
import javax.microedition.lcdui.Font;
import javax.microedition.lcdui.Form;
import javax.microedition.lcdui.Graphics;
import javax.microedition.media.Manager;
import javax.microedition.media.Player;
import javax.microedition.midlet.MIDlet;
import javax.microedition.rms.RecordStore;

public final class e extends Canvas implements Runnable, CommandListener {
   public static final Font a = Font.getFont(0, 1, 0);
   public static final Font b = Font.getFont(0, 1, 8);
   public static final int a;
   public static final int b;
   public static final int c;
   public static final int d;
   public static final short[] a = new short[]{45, 43};
   public static final short[] b = new short[]{57, 57};
   public static final byte[][] a = new byte[][]{{10, 11, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9}, {12, -1, 11, -1, 10, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9}};
   private static Display a;
   private boolean c = false;
   private boolean d = true;
   public a a;
   public static int e;
   public static int f;
   public int g = 0;
   public int h;
   public int i = 0;
   public long a;
   public static f[] a = new f[2];
   public static Random a = new Random();
   public static boolean[] a = new boolean[]{true, true, true, true};
   public static String[] a;
   public boolean a = false;
   public static int j = -1;
   public static int k;
   public static boolean b = false;
   public static final String[] b = new String[]{
      "main_theme", "bg_story", "bg_good", "bg_bad", "battle_good", "battle_bad", "victory", "gameover", "game_complete"
   };
   public static final byte[] a = new byte[]{1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1};
   public static Player[] a;
   public static Player a;
   public static boolean[] b;
   public static int l;
   public static int m;
   public static byte[][] b;
   public static String[] c;

   public e(MIDlet var1) {
      try {
         this.setFullScreenMode(true);
         a.a = this;
         a.a("/lang.dat", false);
         e = this.getWidth();
         f = this.getHeight();
         a = Display.getDisplay(var1);
         a.setCurrent(this);
         new Thread(this).start();
      } catch (Exception var3) {
         this.a(var3.toString());
      }
   }

   public static final int a(int var0) {
      return a(0, var0);
   }

   public static final int a(int var0, int var1) {
      return var0 + Math.abs(a.nextInt()) % (var1 - var0);
   }

   public static final int a() {
      return a.nextInt();
   }

   public static final byte[] a(String var0, int var1) throws Exception {
      RecordStore var2;
      byte[] var3 = (var2 = RecordStore.openRecordStore(var0, false)).getRecord(var1 + 1);
      var2.closeRecordStore();
      return var3;
   }

   public static final void a(String var0, int var1, byte[] var2) throws Exception {
      RecordStore var3;
      int var4;
      if ((var4 = (var3 = RecordStore.openRecordStore(var0, true)).getNumRecords()) > var1) {
         var3.setRecord(var1 + 1, var2, 0, var2.length);
      } else {
         while (var4 < var1) {
            var3.addRecord(null, 0, 0);
            var4++;
         }

         var3.addRecord(var2, 0, var2.length);
      }

      var3.closeRecordStore();
   }

   public static final int a(String var0, byte[] var1) throws Exception {
      RecordStore var2;
      int var3 = (var2 = RecordStore.openRecordStore(var0, true)).addRecord(var1, 0, var1.length);
      var2.closeRecordStore();
      return var3 - 1;
   }

   public static final void a(String var0, int var1) throws Exception {
      RecordStore var2;
      (var2 = RecordStore.openRecordStore(var0, true)).deleteRecord(var1 + 1);
      var2.closeRecordStore();
   }

   public static final int a(String var0) {
      int var1 = 0;

      try {
         RecordStore var2;
         var1 = (var2 = RecordStore.openRecordStore(var0, true)).getSizeAvailable();
         var2.closeRecordStore();
      } catch (Exception var3) {
      }

      return var1;
   }

   public static final int a(byte var0, String var1) {
      return a[var0].p * var1.length();
   }

   public static final int a(byte var0) {
      return a[var0].q;
   }

   public static final void a(Graphics var0, int var1) {
      var0.setColor(var1);
   }

   public final void showNotify() {
      this.a = false;
      b = false;
      this.b();
      if (this.a != null) {
         this.a.a();
      }
   }

   public final void hideNotify() {
      this.b();
      if (this.a != null) {
         if (!this.a) {
            b = true;
            if (a != null && a.getState() == 400 && a[l] == 1) {
               j = l;
               k = m;
            }

            f();
         }

         this.a = false;
      }
   }

   public static final void a(Graphics var0, String var1, int var2, int var3, int var4, int var5) {
      if ((var5 & 8) != 0) {
         var2 -= a((byte)var4, var1);
      } else if ((var5 & 1) != 0) {
         var2 -= a((byte)var4, var1) / 2;
      }

      if ((var5 & 32) != 0) {
         var3 -= a((byte)var4);
      } else if ((var5 & 2) != 0) {
         var3 -= a((byte)var4) / 2;
      }

      a(var0, var1, var2, var3, var4);
   }

   public static final void a(Graphics var0, String var1, int var2, int var3, int var4) {
      boolean var5 = false;
      int var8 = 0;

      for (int var9 = var1.length(); var8 < var9; var8++) {
         char var7;
         if ((var7 = var1.charAt(var8)) >= a[var4] && var7 <= b[var4]) {
            byte var6;
            if ((var6 = a[var4][var7 - a[var4]]) != -1) {
               a[var4].c(var6);
               a[var4].a(var0, var2, var3);
               var2 += a[var4].p;
            } else {
               byte[] var10 = new byte[]{(byte)var7};
               String var11 = new String(var10);
               var0.drawString(var11, var2, var3, 20);
               var2 += var0.getFont().stringWidth(var11);
            }
         }
      }
   }

   public static final void b(Graphics var0, String var1, int var2, int var3, int var4) {
      var0.drawString(var1, var2, var3 - 2, var4);
   }

   public final void a(a var1) {
      this.b();
      var1.a();
      this.a = var1;
   }

   public final void a() {
      this.repaint();
      this.serviceRepaints();
   }

   public final void paint(Graphics var1) {
      if (this.d) {
         var1.setColor(16777215);
         var1.fillRect(0, 0, e, f);
         var1.setFont(b);
         var1.setColor(0);
         var1.drawString(a.a(58), e / 2, f / 2 - 1, 33);
      } else {
         this.a.a(var1);
      }
   }

   public final int getGameAction(int var1) {
      try {
         switch (var1) {
            case -7:
               return 2048;
            case -6:
               return 1024;
            case 48:
               return 32;
            case 49:
               return 64;
            case 50:
               return 1;
            case 51:
               return 128;
            case 52:
               return 4;
            case 53:
               return 16;
            case 54:
               return 8;
            case 55:
               return 256;
            case 56:
               return 2;
            case 57:
               return 512;
            default:
               switch (super.getGameAction(var1)) {
                  case 1:
                     return 1;
                  case 2:
                     return 4;
                  case 3:
                  case 4:
                  case 7:
                  default:
                     break;
                  case 5:
                     return 8;
                  case 6:
                     return 2;
                  case 8:
                     return 16;
               }
         }
      } catch (Exception var3) {
      }

      return 4096;
   }

   public final String a(int var1) {
      byte var2 = 0;
      switch (var1) {
         case 1:
            var2 = 50;
            break;
         case 2:
            var2 = 56;
            break;
         case 4:
            var2 = 52;
            break;
         case 8:
            var2 = 54;
            break;
         case 16:
            var2 = 53;
            break;
         case 32:
            var2 = 48;
            break;
         case 64:
            var2 = 49;
            break;
         case 128:
            var2 = 51;
            break;
         case 256:
            var2 = 55;
            break;
         case 512:
            var2 = 57;
      }

      return super.getKeyName(var2);
   }

   public final void keyPressed(int var1) {
      int var2 = this.getGameAction(var1);
      this.a(var2);
      if (this.a != null) {
         this.a.a(var1, var2);
      }
   }

   public final boolean a() {
      return this.g != 0;
   }

   public final void b() {
      this.i = 0;
      this.g = 0;
      this.h = 0;
   }

   public final boolean a(int var1) {
      boolean var2 = (this.h & var1) != 0;
      this.h &= ~var1;
      return var2;
   }

   public final boolean b(int var1) {
      return (this.g & var1) != 0;
   }

   public final void keyReleased(int var1) {
      this.b(this.getGameAction(var1));
   }

   public final boolean c(int var1) {
      return this.i == var1 && System.currentTimeMillis() - this.a >= 400L;
   }

   public final void a(int var1) {
      this.i = var1;
      this.a = System.currentTimeMillis();
      this.g |= var1;
      this.h |= var1;
   }

   public final void b(int var1) {
      if (var1 == this.i) {
         this.i = 0;
      }

      this.g &= ~var1;
   }

   public final void a(String var1) {
      this.c = false;
      Form var2;
      (var2 = new Form("Fatal error!")).append(var1);
      Command var3 = new Command("Exit", 7, 1);
      var2.addCommand(var3);
      var2.setCommandListener(this);
      a.setCurrent(var2);
   }

   public final void c() {
      this.c = false;
   }

   public static final void d() throws Exception {
      a[0] = new f("chars");
      a[1] = new f("lchars");
   }

   public final void run() {
      try {
         this.a();
         a = new String[]{a.a(26), a.a(28), a.a(25), a.a(24)};
         i var2 = new i();
         this.a();
         this.a = var2;
         this.d = false;
         this.c = true;
         var2.b();

         while (this.c) {
            long var3 = System.currentTimeMillis();
            if (this.isShown() && !b) {
               if (j >= 0) {
                  b(j, k);
                  if (a != null && a.getState() == 400) {
                     j = -1;
                  }
               }

               this.a.c();
               this.a();
            }

            int var5 = (int)(System.currentTimeMillis() - var3);
            int var6;
            if ((var6 = 65 - var5) < 10) {
               var6 = 10;
            }

            if (var6 > 0) {
               try {
                  Thread.sleep(var6);
               } catch (Exception var8) {
               }
            }
         }

         if (b.a != null) {
            b.a.notifyDestroyed();
            b.a.destroyApp(true);
         }
      } catch (Exception var9) {
         var9.printStackTrace();
         this.a(var9.toString());
      }
   }

   public static final void c(int var0) {
      try {
         if (a[1]) {
            a.vibrate(var0 * 4);
         }
      } catch (Exception var2) {
      }
   }

   public static final void e() {
      a = new Player[b.length];
      b = new boolean[b.length];
   }

   public static final void d(int var0) {
      try {
         b[var0] = false;
         InputStream var1 = a(b[var0] + ".mid");
         a[var0] = Manager.createPlayer(var1, "audio/midi");
         a[var0].realize();
         a[var0].prefetch();
         b[var0] = true;
      } catch (Exception var2) {
      }
   }

   public static final void a(int var0, int var1) {
      b(var0, var1);
   }

   public static final void f() {
      try {
         if (a != null) {
            a.stop();
            a = null;
            l = -1;
         }
      } catch (Exception var1) {
      }
   }

   public static final void b(int var0, int var1) {
      try {
         if (b[var0]) {
            if (a != null) {
               a.stop();
            }

            if (a[var0] == 1 && a[0]) {
               if (var1 == 0) {
                  var1 = -1;
               }

               if (b) {
                  j = var0;
                  k = var1;
               } else {
                  a = a[var0];
                  a.setLoopCount(var1);
                  a.start();
                  l = var0;
                  m = var1;
               }
            }
         }
      } catch (Exception var3) {
      }
   }

   public static final void e(int var0) {
      try {
         if (b[var0]) {
            if (a == a[var0]) {
               a.stop();
               a = null;
               l = -1;
            }
         }
      } catch (Exception var2) {
      }
   }

   public static final void b(String var0) throws Exception {
      if (c == null) {
         c = null;
         Object var1 = null;
         Object var2 = null;
         InputStream var3 = b.a.getClass().getResourceAsStream("/1.pak");
         DataInputStream var4;
         short var5 = (var4 = new DataInputStream(var3)).readShort();
         short var6;
         c = new String[var6 = var4.readShort()];
         var1 = new int[var6];
         var2 = new int[var6];

         for (int var7 = 0; var7 < var6; var7++) {
            c[var7] = var4.readUTF();
            ((Object[])var1)[var7] = var4.readInt() + var5;
            ((Object[])var2)[var7] = var4.readShort();
         }

         b = new byte[c.length][];

         for (int var8 = 0; var8 < c.length; var8++) {
            b[var8] = new byte[((Object[])var2)[var8]];
            var4.readFully(b[var8]);
         }

         var4.close();
      }
   }

   public static final byte[] a(String var0) {
      for (int var1 = 0; var1 < c.length; var1++) {
         if (var0.equals(c[var1])) {
            return b[var1];
         }
      }

      return null;
   }

   public static final InputStream a(String var0) throws Exception {
      return new ByteArrayInputStream(a(var0));
   }

   public final void commandAction(Command var1, Displayable var2) {
      b.a.notifyDestroyed();
   }

   static {
      a = b.getBaselinePosition();
      b = a + 6;
      c = a.getBaselinePosition();
      d = c + 8;
   }
}
