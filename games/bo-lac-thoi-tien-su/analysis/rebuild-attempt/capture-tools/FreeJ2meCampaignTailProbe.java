import java.io.File;
import javax.imageio.ImageIO;
import org.recompile.mobile.Mobile;
import org.recompile.mobile.MobilePlatform;

/** Continue the original campaign's bounded keypad flow to locate gameplay entry. */
public final class FreeJ2meCampaignTailProbe {
    private static void tap(MobilePlatform p) throws Exception {
        p.keyPressed(Mobile.KEY_NUM5);
        Thread.sleep(140L);
        p.keyReleased(Mobile.KEY_NUM5);
        Thread.sleep(2600L);
    }
    private static void capture(MobilePlatform p, File dir, int index) throws Exception {
        File out = new File(dir, String.format("%02d.png", index));
        if (!ImageIO.write(p.getLCD(), "png", out)) throw new IllegalStateException("PNG writer unavailable");
        System.out.println("frame " + index + " " + out.getAbsolutePath());
    }
    public static void main(String[] args) throws Exception {
        if (args.length != 2) throw new IllegalArgumentException("usage: FreeJ2meCampaignTailProbe <original.jar> <new-output-dir>");
        File dir = new File(args[1]);
        if (!dir.mkdir()) throw new IllegalStateException("output directory must be new");
        MobilePlatform p = new MobilePlatform(240, 320);
        Mobile.setPlatform(p);
        p.setPainter(new Runnable() { public void run() {} });
        System.out.println("loadJar=" + p.loadJar(new File(args[0]).toURI().toURL().toString()));
        p.runJar();
        Thread.sleep(6500L);
        for (int i = 1; i <= 25; i++) {
            tap(p);
            capture(p, dir, i);
        }
        System.exit(0);
    }
}
