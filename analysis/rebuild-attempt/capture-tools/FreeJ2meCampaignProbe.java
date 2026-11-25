import java.io.File;
import javax.imageio.ImageIO;
import org.recompile.mobile.Mobile;
import org.recompile.mobile.MobilePlatform;

/** Capture the original campaign's first screens without modifying its JAR. */
public final class FreeJ2meCampaignProbe {
    private static void tap(MobilePlatform p, int key) throws Exception {
        p.keyPressed(key);
        Thread.sleep(140L);
        p.keyReleased(key);
        Thread.sleep(2600L);
    }
    private static void capture(MobilePlatform p, File dir, String name) throws Exception {
        File file = new File(dir, name + ".png");
        if (!ImageIO.write(p.getLCD(), "png", file)) throw new IllegalStateException("PNG writer unavailable");
        System.out.println("captured " + file.getAbsolutePath());
    }
    public static void main(String[] args) throws Exception {
        if (args.length != 2) throw new IllegalArgumentException("usage: FreeJ2meCampaignProbe <original.jar> <new-output-dir>");
        File dir = new File(args[1]);
        if (!dir.mkdir()) throw new IllegalStateException("output directory must be new");
        MobilePlatform p = new MobilePlatform(240, 320);
        Mobile.setPlatform(p);
        p.setPainter(new Runnable() { public void run() {} });
        System.out.println("loadJar=" + p.loadJar(new File(args[0]).toURI().toURL().toString()));
        p.runJar();
        Thread.sleep(6500L);
        capture(p, dir, "00-start");
        tap(p, Mobile.KEY_NUM5); capture(p, dir, "01-after-first-fire");
        tap(p, Mobile.KEY_NUM5); capture(p, dir, "02-after-second-fire");
        tap(p, Mobile.KEY_NUM5); capture(p, dir, "03-mode-menu");
        tap(p, Mobile.KEY_NUM5); capture(p, dir, "04-campaign-selected");
        tap(p, Mobile.KEY_NUM8); capture(p, dir, "05-move-down");
        tap(p, Mobile.KEY_NUM5); capture(p, dir, "06-start-new");
        for (int i = 0; i < 8; i++) { tap(p, Mobile.KEY_NUM5); capture(p, dir, String.format("%02d-intro", 7 + i)); }
        System.exit(0);
    }
}
