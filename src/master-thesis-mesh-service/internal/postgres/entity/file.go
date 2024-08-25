package postgres

type File struct {
	Id           string
	Name         string
	OriginalName string
	Format       string
	Size         int64
	Owner        string
	Type         string
	Path         string
	Tags         []string
	Description  string
}
