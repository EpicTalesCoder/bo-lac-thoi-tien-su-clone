import javax.microedition.midlet.MIDlet;

public class b extends MIDlet {
   public static b a;
   public static e a;

   public final void startApp() {
      if (a == null) {
         a = this;
         a = new e(this);
      }
   }

   public final void destroyApp(boolean var1) {
      if (a != null) {
         a.c();
      }

      a = null;
      a = null;
   }

   public final void pauseApp() {
   }
}
