/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  javax.microedition.midlet.MIDlet
 */
import javax.microedition.midlet.MIDlet;

/*
 * Duplicate member names - consider using --renamedupmembers true
 */
public class b
extends MIDlet {
    public static b a;
    public static e a;

    public final void startApp() {
        if (a == null) {
            a = this;
            a = new e(this);
        }
    }

    public final void destroyApp(boolean bl) {
        if (a != null) {
            a.c();
        }
        a = null;
        a = null;
    }

    public final void pauseApp() {
    }
}

