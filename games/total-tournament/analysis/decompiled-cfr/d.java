/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  javax.microedition.lcdui.Display
 *  javax.microedition.media.Manager
 *  javax.microedition.media.Player
 *  javax.microedition.midlet.MIDlet
 */
import java.io.InputStream;
import javax.microedition.lcdui.Display;
import javax.microedition.media.Manager;
import javax.microedition.media.Player;
import javax.microedition.midlet.MIDlet;

public final class d
implements Runnable {
    private static boolean b;
    private static e c;
    private static boolean d;
    private static boolean e;
    private static boolean f;
    private static boolean g;
    private static Player[] h;
    private static boolean i;
    static d a;
    private static int j;
    private static int k;
    private static int l;
    private static Thread m;
    private static long n;

    static {
        g = false;
        f = false;
        e = true;
        b = false;
        i = true;
        k = -1;
        d = true;
        l = -1;
        n = 0L;
    }

    private d(e e2) {
        c = e2;
        if (e) {
            e.u = 6;
        }
    }

    private static void b(int n) {
        if (e) {
            e.u = 6;
        }
        if (h == null) {
            h = new Player[e.u + 1];
        }
        if (h[n] != null) {
            return;
        }
        String string = "/" + n + ".mid";
        if (n == e.u) {
            string = "/mm.mid";
        }
        int n2 = n;
        String string2 = string;
        d.h[n2] = null;
        InputStream inputStream = null;
        try {
            inputStream = c.getClass().getResourceAsStream(string2);
        }
        catch (Exception exception) {}
        try {
            if (inputStream == null && string2.endsWith(".mid")) {
                string2 = string2.substring(0, string2.length() - 4) + ".amr";
                inputStream = c.getClass().getResourceAsStream(string2);
            }
        }
        catch (Exception exception) {}
        try {
            String string3 = "audio/midi";
            if (string2.endsWith(".amr")) {
                string3 = "audio/amr";
            }
            d.h[n2] = Manager.createPlayer((InputStream)inputStream, (String)string3);
            h[n2].realize();
            h[n2].prefetch();
            return;
        }
        catch (Exception exception) {
            return;
        }
    }

    private static void c() {
        if (h == null) {
            d.d();
        }
        if (i) {
            d = true;
            if (m == null) {
                m = new Thread(a);
                m.start();
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
        int n = 0;
        while (n < h.length) {
            if (h[n] == null) {
                d.b(n);
            }
            ++n;
        }
    }

    public final void run() {
        if (h == null) {
            d.d();
        }
        int n = -1;
        while (d) {
            if (k >= 0 && n >= 0 && n != k && !d.e()) {
                d.a(k, false);
                l = n = k;
            }
            try {
                Thread.sleep(3L);
            }
            catch (Exception exception) {}
            if (j >= 0) {
                d.c(j);
                n = j;
                j = -1;
            }
            try {
                Thread.sleep(17L);
            }
            catch (Exception exception) {}
        }
    }

    public static final void a(int n) {
        if (h == null) {
            d.c();
        }
        if (i) {
            j = n;
            return;
        }
        d.c(n);
    }

    private static void c(int n) {
        if (h == null) {
            d.c();
        }
        d.a(n, true);
    }

    private static void a(int n, boolean bl) {
        if (l >= 0) {
            d.d(l);
        }
        int n2 = n;
        try {
            if (h[n2] == null) {
                d.b(n2);
            }
            if (h[n2] != null) {
                if (h[n2].getState() == 0) {
                    d.b(n2);
                }
                if (h[n2].getState() == 100) {
                    h[n2].realize();
                }
                if (h[n2].getState() == 200) {
                    h[n2].prefetch();
                }
            }
        }
        catch (Exception exception) {}
        try {
            if (bl) {
                h[n].start();
            }
            l = n;
            return;
        }
        catch (Exception exception) {
            return;
        }
    }

    public static final void a(e e2) {
        a = new d(e2);
        if (e) {
            e.u = 6;
        }
    }

    private static boolean e() {
        try {
            return l >= 0 && h[l] != null && h[l].getState() == 400;
        }
        catch (Exception exception) {
            return false;
        }
    }

    private static void d(int n) {
        if (n >= 0 && h[n] != null) {
            try {
                if (h[n].getState() == 400) {
                    h[n].stop();
                }
                return;
            }
            catch (Exception exception) {}
        }
    }

    public static void a() {
        if (h != null) {
            try {
                int n = 0;
                while (n < h.length) {
                    d.d(n);
                    ++n;
                }
                return;
            }
            catch (Exception exception) {}
        }
    }

    public static void b() {
        int n = 110;
        long l = System.currentTimeMillis();
        if (l >= d.n) {
            try {
                Display.getDisplay((MIDlet)tr.a).vibrate(110);
            }
            catch (Exception exception) {}
            d.n = l + (long)110 + 7L;
        }
    }
}

