import javax.microedition.media.Controllable;
import java.io.InputStream;
import javax.microedition.media.Manager;
import java.io.ByteArrayInputStream;
import javax.microedition.media.Player;
import javax.microedition.media.control.VolumeControl;
import javax.microedition.media.PlayerListener;

// 
// Decompiled by Procyon v0.6.0
// 

public final class a implements PlayerListener
{
    VolumeControl a;
    Player a;
    
    public a(final String s) {
        try {
            final ByteArrayInputStream byteArrayInputStream = new ByteArrayInputStream(f.w, f.f[f.f], f.e[f.f]);
            this.a = Manager.createPlayer((InputStream)byteArrayInputStream, s);
            byteArrayInputStream.close();
            this.a.realize();
            this.a.addPlayerListener((PlayerListener)this);
        }
        catch (final Exception ex) {}
    }
    
    private void c() {
        try {
            if (this.a == null) {
                return;
            }
            if (this.a.getState() == 300) {
                this.a();
            }
            if (this.a.getState() != 400) {
                this.a.prefetch();
                this.a.start();
            }
        }
        catch (final Exception ex) {}
    }
    
    final void a() {
        try {
            if (this.a == null) {
                return;
            }
            if (this.a.getState() == 400) {
                this.a.setMediaTime(0L);
                this.a.stop();
            }
        }
        catch (final Exception ex) {}
    }
    
    final int a() {
        if (this.a == null) {
            return -1;
        }
        return this.a.getState();
    }
    
    final void b() {
        if (this.a == null) {
            return;
        }
        if (this.a.getState() != 0) {
            this.a.close();
        }
    }
    
    final void a(final int n) {
        try {
            if (this.a == null) {
                return;
            }
            this.a = (VolumeControl)((Controllable)this.a).getControl("VolumeControl");
            if (n != 0) {
                if (this.a.getState() != 400) {
                    this.c();
                }
                this.a.setLevel(n * 20);
                return;
            }
            this.a();
        }
        catch (final Exception ex) {}
    }
    
    public final void playerUpdate(final Player player, final String s, final Object o) {
        if (s.equals("deviceUnavailable")) {
            this.a();
            System.currentTimeMillis();
        }
        if (s.equals("deviceAvailable")) {
            this.c();
        }
    }
}
