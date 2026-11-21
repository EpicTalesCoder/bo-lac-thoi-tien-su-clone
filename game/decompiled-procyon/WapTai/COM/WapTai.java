// 
// Decompiled by Procyon v0.6.0
// 

package WapTai.COM;

import javax.microedition.io.ConnectionNotFoundException;
import javax.microedition.midlet.MIDlet;

public class WapTai extends MIDlet
{
    public void startApp() {
        try {
            this.platformRequest("https://waptai.com");
        }
        catch (final ConnectionNotFoundException ex) {
            ((Throwable)ex).printStackTrace();
        }
        this.destroyApp(true);
    }
    
    public void pauseApp() {
    }
    
    public void destroyApp(final boolean unconditional) {
        this.notifyDestroyed();
    }
}
