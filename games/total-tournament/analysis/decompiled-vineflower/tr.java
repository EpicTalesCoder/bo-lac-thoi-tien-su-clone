import javax.microedition.midlet.MIDlet;

public final class tr extends MIDlet {
   static tr a;
   static e b;

   public tr() {
      a = this;
      b.d();
      b = new e();
   }

   public final void destroyApp(boolean var1) {
      this.notifyDestroyed();
   }

   public final void pauseApp() {
      this.notifyPaused();
   }

   public final void startApp() {
      e.J = true;
      b.a();
   }
}
