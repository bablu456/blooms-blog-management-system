package in.bablu.blooms.dto;

import java.util.Set;

public class BlogLikeResponse {
    private boolean liked;
    private long likeCount;
    private Set<String> likes;

    public BlogLikeResponse() {
    }

    public BlogLikeResponse(boolean liked, long likeCount, Set<String> likes) {
        this.liked = liked;
        this.likeCount = likeCount;
        this.likes = likes;
    }

    public boolean isLiked() {
        return liked;
    }

    public void setLiked(boolean liked) {
        this.liked = liked;
    }

    public long getLikeCount() {
        return likeCount;
    }

    public void setLikeCount(long likeCount) {
        this.likeCount = likeCount;
    }

    public Set<String> getLikes() {
        return likes;
    }

    public void setLikes(Set<String> likes) {
        this.likes = likes;
    }
}
