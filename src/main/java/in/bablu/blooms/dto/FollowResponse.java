package in.bablu.blooms.dto;

public class FollowResponse {
    private boolean following;
    private long followersCount;
    private long followingCount;

    public FollowResponse() {
    }

    public FollowResponse(boolean following, long followersCount, long followingCount) {
        this.following = following;
        this.followersCount = followersCount;
        this.followingCount = followingCount;
    }

    public boolean isFollowing() {
        return following;
    }

    public void setFollowing(boolean following) {
        this.following = following;
    }

    public long getFollowersCount() {
        return followersCount;
    }

    public void setFollowersCount(long followersCount) {
        this.followersCount = followersCount;
    }

    public long getFollowingCount() {
        return followingCount;
    }

    public void setFollowingCount(long followingCount) {
        this.followingCount = followingCount;
    }
}
