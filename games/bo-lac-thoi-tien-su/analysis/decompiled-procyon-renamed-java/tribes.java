import javax.microedition.lcdui.Displayable;
import javax.microedition.lcdui.Display;
import javax.microedition.midlet.MIDlet;

// 
// Decompiled by Procyon v0.6.0
// 

public class tribes extends MIDlet implements Runnable
{
    f a;
    d a;
    Display a;
    
    public void startApp() {
        if (this.a != null) {
            this.a.e();
            return;
        }
        this.a = Display.getDisplay((MIDlet)this);
        new Thread(this).start();
    }
    
    public void pauseApp() {
        if (this.a != null) {
            this.a.d();
        }
    }
    
    public void destroyApp(final boolean b) {
        if (this.a != null) {
            this.a.b();
        }
    }
    
    public void run() {
        System.gc();
        Thread.yield();
        (this.a = new d(this)).a();
        this.a.a = 0;
        this.a.setCurrent((Displayable)this.a);
        a(1000);
        this.a.a();
        a(2000);
        this.a.a = 1;
        this.a.a();
        System.gc();
        Thread.yield();
        a(2000);
        this.a.a = 2;
        this.a.a();
        Thread.yield();
        this.a.a = 5;
        (this.a = new f(this)).a();
    }
    
    static void a(final int n) {
        try {
            Thread.sleep(n);
        }
        catch (final InterruptedException ex) {}
    }
}
