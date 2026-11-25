import java.io.File;
import javax.imageio.ImageIO;
import org.recompile.mobile.Mobile;
import org.recompile.mobile.MobilePlatform;

/** Reproducibly walk the original JAR from startup into its first campaign map. */
public final class FreeJ2meCampaignWalkthrough {
    private static void key(MobilePlatform p, int key) throws Exception {
        p.keyPressed(key); Thread.sleep(140L); p.keyReleased(key); Thread.sleep(2400L);
    }
    private static void snap(MobilePlatform p, File dir, int n) throws Exception {
        File out = new File(dir, String.format("frame-%02d.png", n));
        if (!ImageIO.write(p.getLCD(), "png", out)) throw new IllegalStateException("PNG writer unavailable");
        System.out.println("frame=" + n + " path=" + out.getAbsolutePath());
    }
    public static void main(String[] args) throws Exception {
        if (args.length != 2) throw new IllegalArgumentException("usage: FreeJ2meCampaignWalkthrough <original.jar> <new-output-dir>");
        File dir = new File(args[1]); if (!dir.mkdir()) throw new IllegalStateException("output must be new");
        MobilePlatform p = new MobilePlatform(240, 320); Mobile.setPlatform(p);
        p.setPainter(new Runnable() { public void run() {} });
        System.out.println("loadJar=" + p.loadJar(new File(args[0]).toURI().toURL().toString())); p.runJar();
        Thread.sleep(6500L); snap(p,dir,0);
        for (int i=1;i<=3;i++) { key(p,Mobile.KEY_NUM5); snap(p,dir,i); }
        key(p,Mobile.KEY_NUM8); snap(p,dir,4); // select New Game, not Continue
        key(p,Mobile.KEY_NUM5); snap(p,dir,5); // confirm New Game
        for (int i=6;i<=28;i++) { key(p,Mobile.KEY_NUM5); snap(p,dir,i); }
        System.exit(0);
    }
}
